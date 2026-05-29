import { Router } from 'express';
import { approve, create, destroy, index, show, update } from '../controllers/propertyController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', optionalAuth, asyncHandler(index));
router.get('/:id', optionalAuth, asyncHandler(show));
router.post('/', authenticate, authorize('seller', 'agent'), upload.array('images', 8), asyncHandler(create));
router.put('/:id', authenticate, authorize('seller', 'agent', 'admin'), upload.array('images', 8), asyncHandler(update));
router.delete('/:id', authenticate, authorize('seller', 'agent', 'admin'), asyncHandler(destroy));
router.patch('/:id/approval', authenticate, authorize('admin'), asyncHandler(approve));

export default router;
