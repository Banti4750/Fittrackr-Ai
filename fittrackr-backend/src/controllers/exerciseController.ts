import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Exercise } from '../models/Exercise';
import { HttpError } from '../middleware/errorHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { muscle, category, level, location, search } = req.query as Record<string, string | undefined>;
  const q: Record<string, unknown> = {};
  if (muscle && muscle !== 'all') q['muscleGroup.primary'] = muscle.toLowerCase();
  if (category && category !== 'all') q.category = category;
  if (level && level !== 'all') q.difficulty = level;
  if (location && location !== 'all') q.location = location.toLowerCase();
  if (search) q.name = { $regex: search, $options: 'i' };
  const exercises = await Exercise.find(q).sort({ name: 1 }).limit(500);
  res.json({ exercises });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const ex = await Exercise.findById(req.params.id);
  if (!ex) throw new HttpError(404, 'Exercise not found');
  res.json({ exercise: ex });
});
