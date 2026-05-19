import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  goals: z.array(z.string()).optional(),
  profilePhoto: z.string().url().optional(),
  dailyCalorieGoal: z.number().int().min(50).max(5000).optional(),
});

const levelSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'elite']),
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = profileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.userId, data, { new: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
});

export const updateLevel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { level } = levelSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.userId, { level }, { new: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
});
