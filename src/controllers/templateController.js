const Template = require('../models/Template');
const User = require('../models/User');

// GET /api/templates - Get templates (public + user's own)
const getTemplates = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get both public templates and user's own templates
    const templates = await Template.find({
      $or: [
        { isPublic: true },
        { userId: user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error in getTemplates:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving templates',
      error: error.message
    });
  }
};

// GET /api/templates/:id - Get single template
const getTemplate = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user can access this template (public or owned by user)
    if (!template.isPublic && template.userId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this template'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error in getTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving template',
      error: error.message
    });
  }
};

// POST /api/templates - Create new template
const createTemplate = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      description,
      design,
      isPublic,
      previewImage
    } = req.body;

    const template = new Template({
      name,
      description,
      design,
      isPublic: isPublic || false,
      userId: user._id,
      previewImage
    });

    await template.save();

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error in createTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};

// PUT /api/templates/:id - Update template
const updateTemplate = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user owns this template
    if (template.userId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this template'
      });
    }

    const {
      name,
      description,
      design,
      isPublic,
      previewImage
    } = req.body;

    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (design !== undefined) template.design = { ...template.design, ...design };
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (previewImage !== undefined) template.previewImage = previewImage;

    await template.save();

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// DELETE /api/templates/:id - Delete template
const deleteTemplate = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user owns this template
    if (template.userId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template'
      });
    }

    await template.deleteOne();

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
