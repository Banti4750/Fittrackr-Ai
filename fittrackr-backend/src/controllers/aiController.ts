import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AIInsight } from '../models/AIInsight';
import { AuthRequest } from '../middleware/auth';
import { generateInsights } from '../services/aiService';

export const generate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const insight = await generateInsights(req.userId!);
  res.status(201).json({ insight });
});

export const latest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const insights = await AIInsight.find({ userId: req.userId })
    .sort({ generatedAt: -1 })
    .limit(10);
  res.json({ insights });
});
