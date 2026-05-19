import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { WorkoutSession } from '../models/WorkoutSession';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { startOfDay } from '../utils/helpers';

function startOfDayUTC(d: Date): Date {
  const c = new Date(d);
  c.setUTCHours(0, 0, 0, 0);
  return c;
}

function daysAgoStart(days: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - days + 1);
  return d;
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function emptySeries(days: number): Array<{ date: string; calories: number }> {
  const start = daysAgoStart(days);
  const out: Array<{ date: string; calories: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push({ date: ymd(d), calories: 0 });
  }
  return out;
}

async function fillSeries(userId: mongoose.Types.ObjectId, days: number) {
  const series = emptySeries(days);
  const byDate = new Map<string, number>(series.map((s) => [s.date, 0]));
  const sessions = await WorkoutSession.find({
    userId,
    date: { $gte: daysAgoStart(days) },
  })
    .select('date caloriesBurned')
    .lean();
  for (const s of sessions) {
    const key = ymd(s.date);
    byDate.set(key, (byDate.get(key) ?? 0) + (s.caloriesBurned ?? 0));
  }
  return series.map((s) => ({ date: s.date, calories: Math.round(byDate.get(s.date) ?? 0) }));
}

export const today = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const start = startOfDay(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const result = await WorkoutSession.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$caloriesBurned' } } },
  ]);
  const total = Math.round(result[0]?.total ?? 0);
  const user = await User.findById(userId).select('dailyCalorieGoal weight').lean();
  res.json({
    date: ymd(start),
    calories: total,
    goal: user?.dailyCalorieGoal ?? 400,
    weightSet: !!user?.weight,
  });
});

export const weekly = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const series = await fillSeries(userId, 7);
  res.json({ series });
});

export const monthly = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const series = await fillSeries(userId, 30);
  res.json({ series });
});

export const summary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 29);

  const [agg, allTimeAgg, sessionCountAgg] = await Promise.all([
    WorkoutSession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          today: {
            $sum: {
              $cond: [{ $gte: ['$date', todayStart] }, '$caloriesBurned', 0],
            },
          },
          thisWeek: {
            $sum: {
              $cond: [{ $gte: ['$date', weekStart] }, '$caloriesBurned', 0],
            },
          },
          thisMonth: {
            $sum: {
              $cond: [{ $gte: ['$date', monthStart] }, '$caloriesBurned', 0],
            },
          },
        },
      },
    ]),
    WorkoutSession.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$caloriesBurned' }, count: { $sum: 1 } } },
    ]),
    WorkoutSession.countDocuments({ userId, caloriesBurned: { $gt: 0 } }),
  ]);

  const row = agg[0] ?? { today: 0, thisWeek: 0, thisMonth: 0 };
  const all = allTimeAgg[0] ?? { total: 0, count: 0 };
  const avg = sessionCountAgg > 0 ? Math.round((all.total ?? 0) / sessionCountAgg) : 0;
  const user = await User.findById(userId).select('dailyCalorieGoal weight').lean();

  res.json({
    today: Math.round(row.today ?? 0),
    thisWeek: Math.round(row.thisWeek ?? 0),
    thisMonth: Math.round(row.thisMonth ?? 0),
    allTime: Math.round(all.total ?? 0),
    avgPerSession: avg,
    sessionCount: sessionCountAgg,
    goal: user?.dailyCalorieGoal ?? 400,
    weightSet: !!user?.weight,
  });
});

// Per-session breakdown for the calorie detail screen.
export const sessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const days = Math.max(1, Math.min(90, parseInt(String(req.query.days ?? '7'), 10) || 7));
  const since = daysAgoStart(days);
  const rows = await WorkoutSession.find({ userId, date: { $gte: since } })
    .sort({ date: -1 })
    .select('date title totalDuration caloriesBurned exercises')
    .lean();
  res.json({
    sessions: rows.map((s) => ({
      _id: s._id,
      date: s.date,
      title: s.title ?? null,
      totalDuration: s.totalDuration,
      caloriesBurned: Math.round(s.caloriesBurned ?? 0),
      exerciseCount: s.exercises?.length ?? 0,
    })),
  });
});
