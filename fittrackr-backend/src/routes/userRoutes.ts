import { Router } from 'express';
import { getProfile, updateProfile, updateLevel } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/level', updateLevel);
export default router;
