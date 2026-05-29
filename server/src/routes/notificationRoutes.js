import { Router } from 'express';
import { index, markRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(index));
router.patch('/:id/read', authenticate, asyncHandler(markRead));

export default router;
