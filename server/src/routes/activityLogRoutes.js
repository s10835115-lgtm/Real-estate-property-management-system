import { Router } from 'express';
import { index } from '../controllers/activityLogController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(index));

export default router;
