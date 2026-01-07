const express = require('express');
const router = express.Router();
const { checkJwt, attachUserId } = require('../middleware/auth');
const {
  getRSVPs,
  getRSVP,
  updateRSVP,
  deleteRSVP
} = require('../controllers/rsvpController');

// All routes require authentication
router.use(checkJwt, attachUserId);

// Get RSVPs for an invite
router.get('/invites/:id/rsvps', getRSVPs);

// RSVP management
router.get('/:id', getRSVP);
router.put('/:id', updateRSVP);
router.delete('/:id', deleteRSVP);

module.exports = router;
