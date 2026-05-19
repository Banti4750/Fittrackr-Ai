import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { today, weekly, monthly, summary, sessions } from '../controllers/caloriesController';

const router = Router();
router.use(requireAuth);
router.get('/today', today);
router.get('/weekly', weekly);
router.get('/monthly', monthly);
router.get('/summary', summary);
router.get('/sessions', sessions);
export default router;
