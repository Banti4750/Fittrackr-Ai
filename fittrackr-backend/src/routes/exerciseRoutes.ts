import { Router } from 'express';
import { list, getOne } from '../controllers/exerciseController';

const router = Router();
router.get('/', list);
router.get('/:id', getOne);
export default router;
