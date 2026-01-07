import ThingToKnow from '../models/ThingToKnow';
import Invite from '../models/Invite';
import User from '../models/User';

// GET /api/invites/:id/things-to-know - Get all things to know for an invite
const getThingsToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const invite = await Invite.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    const { category } = req.query;
    const query = { inviteId: invite._id };

    if (category) {
      query.category = category;
    }

    const thingsToKnow = await ThingToKnow.find(query).sort({ order: 1 });

    res.json({
      success: true,
      thingsToKnow
    });
  } catch (error) {
    console.error('Error in getThingsToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving things to know',
      error: error.message
    });
  }
};

// GET /api/things-to-know/:id - Get single thing to know
const getThingToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const thingToKnow = await ThingToKnow.findById(req.params.id).populate('inviteId');

    if (!thingToKnow) {
      return res.status(404).json({
        success: false,
        message: 'Thing to know not found'
      });
    }

    // Check if user owns the invite
    if (thingToKnow.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this item'
      });
    }

    res.json({
      success: true,
      thingToKnow
    });
  } catch (error) {
    console.error('Error in getThingToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving thing to know',
      error: error.message
    });
  }
};

// POST /api/invites/:id/things-to-know - Create new thing to know
const createThingToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const invite = await Invite.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    const {
      category,
      title,
      description,
      url,
      address,
      phone
    } = req.body;

    // Get the highest order number for this invite
    const maxOrderItem = await ThingToKnow.findOne({ inviteId: invite._id })
      .sort({ order: -1 });

    const order = maxOrderItem ? maxOrderItem.order + 1 : 0;

    const thingToKnow = new ThingToKnow({
      inviteId: invite._id,
      category,
      title,
      description,
      url,
      address,
      phone,
      order
    });

    await thingToKnow.save();

    res.status(201).json({
      success: true,
      thingToKnow
    });
  } catch (error) {
    console.error('Error in createThingToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating thing to know',
      error: error.message
    });
  }
};

// PUT /api/things-to-know/:id - Update thing to know
const updateThingToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const thingToKnow = await ThingToKnow.findById(req.params.id).populate('inviteId');

    if (!thingToKnow) {
      return res.status(404).json({
        success: false,
        message: 'Thing to know not found'
      });
    }

    // Check if user owns the invite
    if (thingToKnow.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const {
      category,
      title,
      description,
      url,
      address,
      phone
    } = req.body;

    if (category !== undefined) thingToKnow.category = category;
    if (title !== undefined) thingToKnow.title = title;
    if (description !== undefined) thingToKnow.description = description;
    if (url !== undefined) thingToKnow.url = url;
    if (address !== undefined) thingToKnow.address = address;
    if (phone !== undefined) thingToKnow.phone = phone;

    await thingToKnow.save();

    res.json({
      success: true,
      thingToKnow
    });
  } catch (error) {
    console.error('Error in updateThingToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating thing to know',
      error: error.message
    });
  }
};

// DELETE /api/things-to-know/:id - Delete thing to know
const deleteThingToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const thingToKnow = await ThingToKnow.findById(req.params.id).populate('inviteId');

    if (!thingToKnow) {
      return res.status(404).json({
        success: false,
        message: 'Thing to know not found'
      });
    }

    // Check if user owns the invite
    if (thingToKnow.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await thingToKnow.deleteOne();

    res.json({
      success: true,
      message: 'Thing to know deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteThingToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting thing to know',
      error: error.message
    });
  }
};

// POST /api/invites/:id/things-to-know/reorder - Reorder things to know
const reorderThingsToKnow = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const invite = await Invite.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of ordered IDs'
      });
    }

    // Update order for each item
    const updatePromises = orderedIds.map((id, index) =>
      ThingToKnow.findOneAndUpdate(
        { _id: id, inviteId: invite._id },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    const thingsToKnow = await ThingToKnow.find({ inviteId: invite._id })
      .sort({ order: 1 });

    res.json({
      success: true,
      message: 'Items reordered successfully',
      thingsToKnow
    });
  } catch (error) {
    console.error('Error in reorderThingsToKnow:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering items',
      error: error.message
    });
  }
};

export default {
  getThingsToKnow,
  getThingToKnow,
  createThingToKnow,
  updateThingToKnow,
  deleteThingToKnow,
  reorderThingsToKnow
};
