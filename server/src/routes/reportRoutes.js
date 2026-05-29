import { Router } from 'express';
import { summary } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', authenticate, authorize('agent', 'admin'), asyncHandler(summary));

export default router;
