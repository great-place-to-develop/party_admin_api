const express = require('express');
const router = express.Router();
const { getPublicInvite, submitRSVP, getInviteQRCode } = require('../controllers/publicController');
const { checkJwt, attachUserId } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/invites/public/:token', getPublicInvite);
router.post('/invites/public/:token/rsvp', submitRSVP);

// QR code route (requires authentication)
router.get('/invites/:id/qr', checkJwt, attachUserId, getInviteQRCode);

module.exports = router;
