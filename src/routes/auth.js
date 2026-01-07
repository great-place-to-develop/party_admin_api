const express = require('express');
const router = express.Router();
const { checkJwt, attachUserId } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { getOrCreateProfile } = require('../controllers/authController');

// POST /api/auth/profile - Get or create user profile
router.post('/profile', authLimiter, checkJwt, attachUserId, getOrCreateProfile);

module.exports = router;
