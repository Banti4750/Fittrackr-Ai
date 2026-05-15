import { Router } from 'express';
import { generate, latest } from '../controllers/aiController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.post('/insights', generate);
router.get('/insights/latest', latest);
export default router;
