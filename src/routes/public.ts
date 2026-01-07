import express from 'express';
const router = express.Router();
import { getPublicInvite, submitRSVP, getInviteQRCode } from '../controllers/publicController';
import { checkJwt, attachUserId } from '../middleware/auth';

// Public routes (no authentication required)
router.get('/invites/public/:token', getPublicInvite);
router.post('/invites/public/:token/rsvp', submitRSVP);

// QR code route (requires authentication)
router.get('/invites/:id/qr', checkJwt, attachUserId, getInviteQRCode);

export default router;
