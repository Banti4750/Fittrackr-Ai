import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { z } from 'zod';
import { WorkoutSession, IWorkoutExercise } from '../models/WorkoutSession';
import { Exercise } from '../models/Exercise';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';
import {
  calcVolume,
  calcDuration,
  calcSessionCalories,
  metForCategory,
  bestSetValue,
  FALLBACK_BODYWEIGHT_KG,
} from '../utils/helpers';
import { updateStreakOnWorkout } from '../services/streakService';

const setSchema = z.object({
  reps: z.number().int().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
  restSeconds: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

const exerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(setSchema).default([]),
});

const createSchema = z.object({
  date: z.string().datetime().optional(),
  title: z.string().optional(),
  exercises: z.array(exerciseSchema).default([]),
  totalDuration: z.number().optional(),
  mood: z.enum(['great', 'okay', 'tired']).optional(),
  notes: z.string().optional(),
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
  const userId = req.userId!;

  const exercises: IWorkoutExercise[] = data.exercises.map((e) => ({
    exerciseId: new mongoose.Types.ObjectId(e.exerciseId),
    sets: e.sets,
    personalBest: false,
  }));

  // Detect PRs by comparing with the user's historical max per exercise (weight × reps).
  for (const ex of exercises) {
    const prior = await WorkoutSession.find({ userId, 'exercises.exerciseId': ex.exerciseId })
      .select('exercises')
      .lean();
    let priorMax = 0;
    for (const p of prior) {
      for (const pe of p.exercises) {
        if (pe.exerciseId.toString() !== ex.exerciseId.toString()) continue;
        for (const ps of pe.sets) priorMax = Math.max(priorMax, bestSetValue(ps));
      }
    }
    let isPR = false;
    for (const s of ex.sets) {
      const val = bestSetValue(s);
      if (val > priorMax) {
        s.isPersonalBest = true;
        priorMax = val;
        isPR = true;
      }
    }
    ex.personalBest = isPR;
  }

  const totalVolume = calcVolume(exercises);
  const totalDuration = data.totalDuration ?? calcDuration(exercises);

  // MET-based calorie burn: load the user's bodyweight + each exercise's
  // metValue/category, compute per-exercise, then sum for the session total.
  const [user, exerciseDocs] = await Promise.all([
    User.findById(userId).select('weight').lean(),
    Exercise.find({ _id: { $in: exercises.map((e) => e.exerciseId) } })
      .select('metValue category')
      .lean(),
  ]);
  const bodyWeightKg = user?.weight ?? FALLBACK_BODYWEIGHT_KG;
  const metByExId = new Map<string, number>();
  for (const ex of exerciseDocs) {
    metByExId.set(ex._id.toString(), ex.metValue ?? metForCategory(ex.category));
  }

  const { perExercise, total: caloriesBurned } = calcSessionCalories({
    exercises: exercises.map((ex) => ({
      met: metByExId.get(ex.exerciseId.toString()) ?? 4.5,
      sets: ex.sets,
    })),
    bodyWeightKg,
    totalMinutes: totalDuration,
  });
  const caloriesPerExercise = exercises.map((ex, i) => ({
    exerciseId: ex.exerciseId,
    calories: perExercise[i],
  }));

  const session = await WorkoutSession.create({
    userId,
    date: data.date ? new Date(data.date) : new Date(),
    title: data.title,
    exercises,
    totalVolume,
    totalDuration,
    caloriesBurned,
    caloriesPerExercise,
    mood: data.mood,
    notes: data.notes,
  });

  await updateStreakOnWorkout(userId, session.date);

  res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({
      "message":"server failed"
    })
  }

});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, page = '1', limit = '20' } = req.query as Record<string, string>;
  const q: Record<string, unknown> = { userId };
  if (startDate || endDate) {
    q.date = {} as Record<string, Date>;
    if (startDate) (q.date as any).$gte = new Date(startDate);
    if (endDate) (q.date as any).$lte = new Date(endDate);
  }
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const [sessions, total] = await Promise.all([
    WorkoutSession.find(q)
      .sort({ date: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate('exercises.exerciseId', 'name muscleGroup imageUrl category difficulty'),
    WorkoutSession.countDocuments(q),
  ]);
  res.json({ sessions, total, page: p, limit: l });
});

export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await WorkoutSession.findOne({
    _id: req.params.id,
    userId: req.userId,
  }).populate('exercises.exerciseId');
  if (!session) throw new HttpError(404, 'Workout not found');
  res.json({ session });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await WorkoutSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!session) throw new HttpError(404, 'Workout not found');
  res.json({ session });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await WorkoutSession.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Workout not found');
  res.json({ ok: true });
});

export const lastPerformed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const rows: Array<{ _id: mongoose.Types.ObjectId; date: Date; sets: any[] }> =
    await WorkoutSession.aggregate([
      { $match: { userId } },
      { $unwind: '$exercises' },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$exercises.exerciseId',
          date: { $first: '$date' },
          sets: { $first: '$exercises.sets' },
        },
      },
    ]);

  const now = Date.now();
  const history: Record<
    string,
    { date: string; daysAgo: number; bestSet?: { weight?: number; reps?: number; duration?: number }; setCount: number }
  > = {};
  for (const r of rows) {
    let best: any = undefined;
    let bestVal = -1;
    for (const s of r.sets ?? []) {
      const v = bestSetValue(s);
      if (v > bestVal) {
        bestVal = v;
        best = s;
      }
    }
    history[r._id.toString()] = {
      date: r.date.toISOString(),
      daysAgo: Math.max(0, Math.floor((now - r.date.getTime()) / (24 * 60 * 60 * 1000))),
      bestSet: best ? { weight: best.weight, reps: best.reps, duration: best.duration } : undefined,
      setCount: r.sets?.length ?? 0,
    };
  }

  res.json({ history });
});
