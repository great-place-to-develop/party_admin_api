import express from 'express';
const router = express.Router();
import { checkJwt, attachUserId } from '../middleware/auth';
import inviteController from '../controllers/inviteController';

const {
  getInvites,
  getInvite,
  createInvite,
  updateInvite,
  deleteInvite,
  sendInvite,
  getInviteStats
} = inviteController;

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

export default router;
