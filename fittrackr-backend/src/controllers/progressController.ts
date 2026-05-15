import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { WorkoutSession } from '../models/WorkoutSession';
import { Exercise } from '../models/Exercise';
import { AuthRequest } from '../middleware/auth';
import { bestSetValue, startOfDay } from '../utils/helpers';

function rangeDays(range?: string): number {
  if (!range) return 30;
  const m = /^(\d+)d$/.exec(range);
  return m ? Math.min(365, Math.max(1, parseInt(m[1], 10))) : 30;
}

export const volume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const days = rangeDays(req.query.range as string | undefined);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const exerciseId = req.query.exercise as string | undefined;

  const match: Record<string, unknown> = { userId, date: { $gte: since } };
  if (exerciseId) match['exercises.exerciseId'] = new mongoose.Types.ObjectId(exerciseId);

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$exercises' },
    { $unwind: '$exercises.sets' },
  ];
  if (exerciseId) {
    pipeline.push({
      $match: { 'exercises.exerciseId': new mongoose.Types.ObjectId(exerciseId) },
    });
  }
  pipeline.push(
    {
      $group: {
        _id: {
          y: { $year: '$date' },
          m: { $month: '$date' },
          d: { $dayOfMonth: '$date' },
        },
        date: { $first: '$date' },
        volume: {
          $sum: {
            $multiply: [
              { $ifNull: ['$exercises.sets.reps', 0] },
              { $ifNull: ['$exercises.sets.weight', 0] },
            ],
          },
        },
        sets: { $sum: 1 },
      },
    },
    { $sort: { date: 1 } }
  );

  const points = await WorkoutSession.aggregate(pipeline);
  res.json({ points });
});

export const personalBests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const sessions = await WorkoutSession.find({ userId }).select('exercises date').lean();
  const map = new Map<string, { value: number; reps: number; weight: number; date: Date }>();
  for (const s of sessions) {
    for (const ex of s.exercises) {
      for (const set of ex.sets) {
        const val = bestSetValue(set);
        const existing = map.get(ex.exerciseId.toString());
        if (!existing || val > existing.value) {
          map.set(ex.exerciseId.toString(), {
            value: val,
            reps: set.reps ?? 0,
            weight: set.weight ?? 0,
            date: s.date,
          });
        }
      }
    }
  }
  const ids = Array.from(map.keys());
  const exercises = await Exercise.find({ _id: { $in: ids } }).select('name muscleGroup imageUrl');
  const bests = exercises.map((e) => ({
    exercise: e,
    ...map.get(e._id.toString())!,
  }));
  bests.sort((a, b) => b.value - a.value);
  res.json({ personalBests: bests });
});

export const frequency = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const days = rangeDays(req.query.range as string | undefined);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sessions = await WorkoutSession.find({ userId, date: { $gte: since } })
    .select('date')
    .lean();
  const byWeek = new Map<string, number>();
  for (const s of sessions) {
    const d = startOfDay(s.date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  const points = Array.from(byWeek.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  res.json({ points, totalWorkouts: sessions.length });
});

export const muscleBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
  const days = rangeDays(req.query.range as string | undefined);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await WorkoutSession.aggregate([
    { $match: { userId, date: { $gte: since } } },
    { $unwind: '$exercises' },
    {
      $lookup: {
        from: 'exercises',
        localField: 'exercises.exerciseId',
        foreignField: '_id',
        as: 'ex',
      },
    },
    { $unwind: '$ex' },
    {
      $group: {
        _id: '$ex.muscleGroup.primary',
        sets: { $sum: { $size: '$exercises.sets' } },
      },
    },
    { $sort: { sets: -1 } },
  ]);
  res.json({ breakdown: result.map((r) => ({ muscle: r._id, sets: r.sets })) });
});
