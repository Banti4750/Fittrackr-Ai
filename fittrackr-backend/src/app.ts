import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import workoutRoutes from './routes/workoutRoutes';
import templateRoutes from './routes/templateRoutes';
import progressRoutes from './routes/progressRoutes';
import bodyStatsRoutes from './routes/bodyStatsRoutes';
import streakRoutes from './routes/streakRoutes';
import userRoutes from './routes/userRoutes';
import aiRoutes from './routes/aiRoutes';
import uploadRoutes from './routes/uploadRoutes';
import caloriesRoutes from './routes/caloriesRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', (_req, res) => res.json({ "message":"ok" }));

  app.use('/api/auth', authRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/bodystats', bodyStatsRoutes);
  app.use('/api/streaks', streakRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/calories', caloriesRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
