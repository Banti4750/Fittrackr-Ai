import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { Streak } from '../models/Streak';
import { signToken, AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';
import { seedStarterTemplates } from '../services/starterTemplates';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  level: z.enum(['beginner', 'intermediate', 'elite']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new HttpError(409, 'Email already in use');
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    level: data.level ?? 'beginner',
  });
  await Streak.create({ userId: user._id });
  try {
    await seedStarterTemplates(user._id);
  } catch (err) {
    console.warn('[auth] starter templates seeding failed:', err);
  }
  const token = signToken(user._id.toString());
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  const token = signToken(user._id.toString());
  res.json({ user, token });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});
