import express from 'express';
const router = express.Router();
import { checkJwt, attachUserId } from '../middleware/auth';
import thingToKnowController from '../controllers/thingToKnowController';

const {
  getThingsToKnow,
  getThingToKnow,
  createThingToKnow,
  updateThingToKnow,
  deleteThingToKnow,
  reorderThingsToKnow
} = thingToKnowController;

// All routes require authentication
router.use(checkJwt, attachUserId);

// Things to know for an invite
router.get('/invites/:id/things-to-know', getThingsToKnow);
router.post('/invites/:id/things-to-know', createThingToKnow);
router.post('/invites/:id/things-to-know/reorder', reorderThingsToKnow);

// Thing to know management
router.get('/:id', getThingToKnow);
router.put('/:id', updateThingToKnow);
router.delete('/:id', deleteThingToKnow);

export default router;
