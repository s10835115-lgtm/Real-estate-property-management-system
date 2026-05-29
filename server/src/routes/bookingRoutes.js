import { Router } from 'express';
import { create, index, updateStatus } from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(index));
router.post('/', authenticate, asyncHandler(create));
router.patch('/:id/status', authenticate, authorize('agent', 'admin', 'seller'), asyncHandler(updateStatus));

export default router;
