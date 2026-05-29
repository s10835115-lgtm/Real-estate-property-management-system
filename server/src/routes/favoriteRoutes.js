import { Router } from 'express';
import { create, destroy, index } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(index));
router.post('/:propertyId', authenticate, asyncHandler(create));
router.delete('/:propertyId', authenticate, asyncHandler(destroy));

export default router;
