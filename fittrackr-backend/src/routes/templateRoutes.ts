import { Router } from 'express';
import { list, create, remove } from '../controllers/templateController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', list);
router.post('/', create);
router.delete('/:id', remove);
export default router;
