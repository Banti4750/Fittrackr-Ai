import { Router } from 'express';
import { volume, personalBests, frequency, muscleBreakdown } from '../controllers/progressController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/volume', volume);
router.get('/personal-bests', personalBests);
router.get('/frequency', frequency);
router.get('/muscle-breakdown', muscleBreakdown);
export default router;
