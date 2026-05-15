import { Router } from 'express';
import {
  volume,
  personalBests,
  frequency,
  muscleBreakdown,
  muscleHeatmap,
} from '../controllers/progressController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/volume', volume);
router.get('/personal-bests', personalBests);
router.get('/frequency', frequency);
router.get('/muscle-breakdown', muscleBreakdown);
router.get('/muscle-heatmap', muscleHeatmap);
export default router;
