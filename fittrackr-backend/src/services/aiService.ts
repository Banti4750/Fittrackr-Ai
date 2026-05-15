import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, hasAI } from '../config/env';
import { WorkoutSession } from '../models/WorkoutSession';
import { Exercise } from '../models/Exercise';
import { User } from '../models/User';
import { AIInsight, IAIInsight, InsightType } from '../models/AIInsight';
import { bestSetValue, daysBetween, startOfDay } from '../utils/helpers';

interface AggregatedExerciseStats {
  exerciseId: string;
  name: string;
  sessions: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
  weightHistory: Array<{ date: string; maxWeight: number; volume: number }>;
  plateaued: boolean;
  trend: 'up' | 'flat' | 'down';
}

export interface InsightPayload {
  weeklyInsight: string;
  improvements: string[];
  concerns: string[];
  suggestedNextWorkout: {
    exercises: Array<{ name: string; sets: number; reps: number; weight?: number }>;
  };
  motivationalMessage: string;
  derivedSignals: {
    plateauedExercises: string[];
    overtrainingRisk: boolean;
    consecutiveWorkoutDays: number;
    progressiveOverload: boolean;
  };
}

async function aggregateUserStats(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sessions = await WorkoutSession.find({ userId, date: { $gte: since } })
    .sort({ date: 1 })
    .populate('exercises.exerciseId', 'name muscleGroup category');

  const perExercise = new Map<string, AggregatedExerciseStats>();
  const workoutDays = new Set<string>();
  for (const s of sessions) {
    workoutDays.add(startOfDay(s.date).toISOString().slice(0, 10));
    for (const ex of s.exercises) {
      const exInfo = ex.exerciseId as unknown as { _id: { toString(): string }; name: string };
      const key = exInfo._id?.toString();
      if (!key) continue;
      let agg = perExercise.get(key);
      if (!agg) {
        agg = {
          exerciseId: key,
          name: exInfo.name,
          sessions: 0,
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
          maxWeight: 0,
          weightHistory: [],
          plateaued: false,
          trend: 'flat',
        };
        perExercise.set(key, agg);
      }
      agg.sessions += 1;
      let sessionVolume = 0;
      let sessionMax = 0;
      for (const set of ex.sets) {
        agg.totalSets += 1;
        agg.totalReps += set.reps ?? 0;
        sessionVolume += bestSetValue(set);
        sessionMax = Math.max(sessionMax, set.weight ?? 0);
      }
      agg.totalVolume += sessionVolume;
      agg.maxWeight = Math.max(agg.maxWeight, sessionMax);
      agg.weightHistory.push({
        date: s.date.toISOString().slice(0, 10),
        maxWeight: sessionMax,
        volume: sessionVolume,
      });
    }
  }

  for (const agg of perExercise.values()) {
    if (agg.weightHistory.length >= 3) {
      const recent = agg.weightHistory.slice(-3);
      const sameMax = recent.every((r) => r.maxWeight === recent[0].maxWeight);
      const span =
        recent.length > 1
          ? daysBetween(new Date(recent[0].date), new Date(recent[recent.length - 1].date))
          : 0;
      if (sameMax && span >= 14) agg.plateaued = true;
    }
    if (agg.weightHistory.length >= 2) {
      const first = agg.weightHistory[0].volume;
      const last = agg.weightHistory[agg.weightHistory.length - 1].volume;
      if (last > first * 1.05) agg.trend = 'up';
      else if (last < first * 0.95) agg.trend = 'down';
    }
  }

  const days = Array.from(workoutDays).sort();
  let consecutive = 0;
  let maxConsecutive = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(d);
    if (prev && daysBetween(prev, cur) === 1) consecutive += 1;
    else consecutive = 1;
    maxConsecutive = Math.max(maxConsecutive, consecutive);
    prev = cur;
  }

  return {
    sessions,
    perExercise: Array.from(perExercise.values()),
    workoutDays: workoutDays.size,
    consecutiveWorkoutDays: maxConsecutive,
    rangeDays: 30,
  };
}

type AggregateResult = Awaited<ReturnType<typeof aggregateUserStats>>;

function buildPrompt(level: string, stats: AggregateResult): string {
  const compact = stats.perExercise.map((e) => ({
    name: e.name,
    sessions: e.sessions,
    totalSets: e.totalSets,
    totalReps: e.totalReps,
    totalVolume: Math.round(e.totalVolume),
    maxWeight: e.maxWeight,
    trend: e.trend,
    plateaued: e.plateaued,
    history: e.weightHistory.slice(-6),
  }));
  return `You are a certified personal trainer AI analyzing 30 days of training data.

USER LEVEL: ${level}
SESSIONS IN PERIOD: ${stats.sessions.length}
WORKOUT DAYS: ${stats.workoutDays}
MAX CONSECUTIVE WORKOUT DAYS: ${stats.consecutiveWorkoutDays}

PER-EXERCISE DATA:
${JSON.stringify(compact, null, 2)}

Return ONLY valid JSON matching this shape (no markdown, no commentary):
{
  "weeklyInsight": "2-3 sentence summary of the trainee's last 30 days",
  "improvements": ["bullet-point wins, e.g. progressive overload, consistency, PRs"],
  "concerns": ["bullet-point risks, e.g. plateau, overtraining, muscle imbalance"],
  "suggestedNextWorkout": {
    "exercises": [{ "name": "...", "sets": 3, "reps": 8, "weight": 60 }]
  },
  "motivationalMessage": "1-2 sentences, energetic, personal"
}

Tailor difficulty and exercise selection to the user's level: ${level}. Be specific and reference the actual data.`;
}

async function callClaude(prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: env.claudeApiKey });
  const resp = await client.messages.create({
    model: env.claudeModel,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = resp.content[0];
  return block.type === 'text' ? block.text : '';
}

async function callOpenAI(prompt: string): Promise<string> {
  const client = new OpenAI({ apiKey: env.openaiApiKey });
  const resp = await client.chat.completions.create({
    model: env.openaiModel,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a certified personal trainer AI. Respond only with valid JSON.' },
      { role: 'user', content: prompt },
    ],
  });
  return resp.choices[0]?.message?.content ?? '';
}

async function callGemini(prompt: string): Promise<string> {
  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: { responseMimeType: 'application/json' },
    systemInstruction: 'You are a certified personal trainer AI. Respond only with valid JSON.',
  });
  const resp = await model.generateContent(prompt);
  return resp.response.text();
}

function safeParseJson(raw: string): Partial<InsightPayload> {
  const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '');
  try {
    return JSON.parse(trimmed) as InsightPayload;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

function fallbackInsight(
  level: string,
  stats: Awaited<ReturnType<typeof aggregateUserStats>>
): InsightPayload {
  const plateaued = stats.perExercise.filter((e) => e.plateaued).map((e) => e.name);
  const trendingUp = stats.perExercise.filter((e) => e.trend === 'up').map((e) => e.name);
  const overtrain = stats.consecutiveWorkoutDays >= 7;
  const improvements: string[] = [];
  const concerns: string[] = [];
  if (trendingUp.length) improvements.push(`Volume trending up on: ${trendingUp.join(', ')}`);
  if (stats.workoutDays >= 12) improvements.push(`Strong consistency — ${stats.workoutDays} workout days in 30`);
  if (plateaued.length) concerns.push(`Plateau detected: ${plateaued.join(', ')} (same max weight 14+ days)`);
  if (overtrain) concerns.push(`${stats.consecutiveWorkoutDays} consecutive workout days — schedule a rest day`);
  if (!improvements.length) improvements.push('Keep logging — we need more data to spot trends');
  if (!concerns.length) concerns.push('No red flags this period');

  return {
    weeklyInsight: `Over the last 30 days you completed ${stats.sessions.length} sessions across ${stats.workoutDays} unique days. Level: ${level}.`,
    improvements,
    concerns,
    suggestedNextWorkout: {
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: 6, weight: undefined },
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Bent Over Row', sets: 3, reps: 10 },
        { name: 'Plank', sets: 3, reps: 1 },
      ],
    },
    motivationalMessage: 'Consistency compounds. Show up, log the work, the gains follow.',
    derivedSignals: {
      plateauedExercises: plateaued,
      overtrainingRisk: overtrain,
      consecutiveWorkoutDays: stats.consecutiveWorkoutDays,
      progressiveOverload: trendingUp.length >= 2,
    },
  };
}

export async function generateInsights(userId: string): Promise<IAIInsight> {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const stats = await aggregateUserStats(userId);

  let payload: InsightPayload;
  if (hasAI()) {
    const prompt = buildPrompt(user.level, stats);
    try {
      const raw = env.geminiApiKey
        ? await callGemini(prompt)
        : env.claudeApiKey
        ? await callClaude(prompt)
        : await callOpenAI(prompt);
      const parsed = safeParseJson(raw);
      const fb = fallbackInsight(user.level, stats);
      payload = {
        weeklyInsight: parsed.weeklyInsight ?? fb.weeklyInsight,
        improvements: parsed.improvements ?? fb.improvements,
        concerns: parsed.concerns ?? fb.concerns,
        suggestedNextWorkout: parsed.suggestedNextWorkout ?? fb.suggestedNextWorkout,
        motivationalMessage: parsed.motivationalMessage ?? fb.motivationalMessage,
        derivedSignals: fb.derivedSignals,
      };
    } catch (err) {
      console.warn('[ai] provider call failed, using fallback:', err);
      payload = fallbackInsight(user.level, stats);
    }
  } else {
    payload = fallbackInsight(user.level, stats);
  }

  const type: InsightType = payload.derivedSignals.overtrainingRisk
    ? 'overtraining_warning'
    : payload.derivedSignals.plateauedExercises.length
    ? 'plateau_alert'
    : payload.derivedSignals.progressiveOverload
    ? 'improvement_tip'
    : 'weekly_summary';

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const insight = await AIInsight.create({
    userId,
    type,
    content: payload.weeklyInsight,
    exercisesAnalyzed: stats.perExercise.map((e) => e.name),
    payload,
    expiresAt,
  });

  return insight;
}

export const _internals = { aggregateUserStats, buildPrompt, safeParseJson };
// Exercise is imported so its model is registered when this service is loaded.
void Exercise;
