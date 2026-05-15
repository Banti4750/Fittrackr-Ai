import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }
  const e = err as { status?: number; message?: string; code?: number };
  if (e?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', details: (err as any).keyValue });
  }
  const status = e?.status && Number.isInteger(e.status) ? e.status : 500;
  const message = e?.message ?? 'Internal server error';
  if (status >= 500) console.error('[err]', err);
  res.status(status).json({ error: message });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
