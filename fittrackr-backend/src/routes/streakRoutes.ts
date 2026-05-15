import { Router } from 'express';
import { get } from '../controllers/streakController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', get);
export default router;
