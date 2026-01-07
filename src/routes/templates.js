const express = require('express');
const router = express.Router();
const { checkJwt, attachUserId } = require('../middleware/auth');
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = require('../controllers/templateController');

// All routes require authentication
router.use(checkJwt, attachUserId);

// Template CRUD
router.get('/', getTemplates);
router.post('/', createTemplate);
router.get('/:id', getTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;
