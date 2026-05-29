import { Router } from 'express';
import { destroy, index, changeRole, toggleSuspend } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(index));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(destroy));
router.patch('/:id/role', authenticate, authorize('admin'), asyncHandler(changeRole));
router.patch('/:id/suspend', authenticate, authorize('admin'), asyncHandler(toggleSuspend));

export default router;
