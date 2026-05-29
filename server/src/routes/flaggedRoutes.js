import { Router } from 'express';
import { create, index, updateStatus } from '../controllers/flaggedController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', authenticate, asyncHandler(create));
router.get('/', authenticate, authorize('admin'), asyncHandler(index));
router.patch('/:id/status', authenticate, authorize('admin'), asyncHandler(updateStatus));

export default router;
