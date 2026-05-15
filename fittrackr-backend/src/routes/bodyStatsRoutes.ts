import { Router } from 'express';
import { create, list, trend } from '../controllers/bodyStatsController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.post('/', create);
router.get('/', list);
router.get('/trend', trend);
export default router;
