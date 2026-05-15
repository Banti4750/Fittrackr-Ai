import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Streak } from '../models/Streak';
import { WorkoutSession } from '../models/WorkoutSession';
import { AuthRequest } from '../middleware/auth';
import { startOfDay } from '../utils/helpers';

export const get = asyncHandler(async (req: AuthRequest, res: Response) => {
  let streak = await Streak.findOne({ userId: req.userId });
  if (!streak) streak = await Streak.create({ userId: req.userId });

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sessions = await WorkoutSession.find({ userId: req.userId, date: { $gte: since } })
    .select('date')
    .lean();

  const days = new Map<string, number>();
  for (const s of sessions) {
    const k = startOfDay(s.date).toISOString().slice(0, 10);
    days.set(k, (days.get(k) ?? 0) + 1);
  }
  const heatmap = Array.from(days.entries()).map(([date, count]) => ({ date, count }));

  res.json({ streak, heatmap });
});
