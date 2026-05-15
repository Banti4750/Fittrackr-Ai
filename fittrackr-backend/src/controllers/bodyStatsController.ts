import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { BodyStats } from '../models/BodyStats';
import { AuthRequest } from '../middleware/auth';

const createSchema = z.object({
  date: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(80).optional(),
  measurements: z
    .object({
      chest: z.number().optional(),
      waist: z.number().optional(),
      hips: z.number().optional(),
      bicep: z.number().optional(),
      thigh: z.number().optional(),
    })
    .optional(),
  photos: z.array(z.string().url()).max(4).optional(),
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body);
  const userId = req.userId!;
  let bmi: number | undefined;
  if (data.weight && req.user?.height) {
    const m = req.user.height / 100;
    bmi = +(data.weight / (m * m)).toFixed(1);
  }
  const entry = await BodyStats.create({ ...data, userId, bmi });
  res.status(201).json({ entry });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entries = await BodyStats.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
  res.json({ entries });
});

export const trend = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entries = await BodyStats.find({ userId: req.userId, weight: { $exists: true } })
    .sort({ date: 1 })
    .select('date weight bodyFat bmi')
    .lean();
  res.json({ points: entries });
});
