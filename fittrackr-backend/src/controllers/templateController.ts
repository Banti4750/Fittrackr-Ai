import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { z } from 'zod';
import { WorkoutTemplate } from '../models/WorkoutTemplate';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const setSchema = z.object({
  reps: z.number().int().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
  restSeconds: z.number().nonnegative().optional(),
});

const exerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(setSchema).default([]),
});

const upsertSchema = z.object({
  name: z.string().min(1).max(80),
  exercises: z.array(exerciseSchema).min(1),
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const templates = await WorkoutTemplate.find({ userId: req.userId })
    .sort({ updatedAt: -1 })
    .populate('exercises.exerciseId', 'name muscleGroup category difficulty');
  res.json({ templates });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = upsertSchema.parse(req.body);
  const template = await WorkoutTemplate.create({
    userId: req.userId,
    name: data.name,
    exercises: data.exercises.map((e) => ({
      exerciseId: new mongoose.Types.ObjectId(e.exerciseId),
      sets: e.sets,
    })),
  });
  res.status(201).json({ template });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await WorkoutTemplate.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Template not found');
  res.json({ ok: true });
});
