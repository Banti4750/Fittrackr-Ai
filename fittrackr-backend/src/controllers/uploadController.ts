import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/auth';
import { uploadBufferToCloudinary } from '../services/cloudinaryService';
import { HttpError } from '../middleware/errorHandler';

export const uploadPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = (req as any).file as { buffer: Buffer; mimetype: string } | undefined;
  if (!file) throw new HttpError(400, 'No file uploaded');
  const folder = (req.body?.folder as string | undefined) ?? `fittrackr/${req.userId}`;
  const url = await uploadBufferToCloudinary(file.buffer, folder);
  res.json({ url });
});
