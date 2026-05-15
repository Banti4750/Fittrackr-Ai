import { Router } from 'express';
import { list, create, update, remove, installStarters } from '../controllers/templateController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', list);
router.post('/', create);
router.post('/install-starters', installStarters);
router.put('/:id', update);
router.delete('/:id', remove);
export default router;
