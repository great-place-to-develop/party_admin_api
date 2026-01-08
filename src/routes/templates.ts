import express from 'express';
const router = express.Router();
import { checkJwt, attachUserId } from '../middleware/auth';
import templateController from '../controllers/templateController';

const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = templateController;

// All routes require authentication
router.use(checkJwt, attachUserId);

// Template CRUD
router.get('/', getTemplates);
router.post('/', createTemplate);
router.get('/:id', getTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
