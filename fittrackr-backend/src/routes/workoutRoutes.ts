import { Router } from 'express';
import { create, list, getOne, update, remove, lastPerformed } from '../controllers/workoutController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.post('/', create);
router.get('/', list);
router.get('/last-performed', lastPerformed);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
export default router;
