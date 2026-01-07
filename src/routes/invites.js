const express = require('express');
const router = express.Router();
const { checkJwt, attachUserId } = require('../middleware/auth');
const {
  getInvites,
  getInvite,
  createInvite,
  updateInvite,
  deleteInvite,
  sendInvite,
  getInviteStats
} = require('../controllers/inviteController');

// All routes require authentication
router.use(checkJwt, attachUserId);

// Invite CRUD
router.get('/', getInvites);
router.post('/', createInvite);
router.get('/:id', getInvite);
router.put('/:id', updateInvite);
router.delete('/:id', deleteInvite);

// Invite actions
router.post('/:id/send', sendInvite);
router.get('/:id/stats', getInviteStats);

module.exports = router;
