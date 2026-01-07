import express from 'express';
const router = express.Router();
import { checkJwt, attachUserId } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { getOrCreateProfile } from '../controllers/authController';

// POST /api/auth/profile - Get or create user profile
router.post('/profile', authLimiter, checkJwt, attachUserId, getOrCreateProfile);

export default router;
