import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto } from '../controllers/uploadController';
import { requireAuth } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();
router.use(requireAuth);
router.post('/photo', upload.single('file'), uploadPhoto);
export default router;
