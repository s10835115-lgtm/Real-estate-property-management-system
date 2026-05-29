import { Router } from 'express';
import { create, index } from '../controllers/enquiryController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', optionalAuth, asyncHandler(create));
router.get('/', authenticate, authorize('seller', 'agent', 'admin'), asyncHandler(index));

export default router;
