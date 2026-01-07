const RSVP = require('../models/RSVP');
const Invite = require('../models/Invite');
const User = require('../models/User');

// GET /api/invites/:id/rsvps - Get all RSVPs for an invite
const getRSVPs = async (req, res) => {
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

    const { status } = req.query;
    const query = { inviteId: invite._id };

    if (status) {
      query.status = status;
    }

    const rsvps = await RSVP.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      rsvps
    });
  } catch (error) {
    console.error('Error in getRSVPs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving RSVPs',
      error: error.message
    });
  }
};

// GET /api/rsvps/:id - Get single RSVP
const getRSVP = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rsvp = await RSVP.findById(req.params.id).populate('inviteId');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    // Check if user owns the invite
    if (rsvp.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this RSVP'
      });
    }

    res.json({
      success: true,
      rsvp
    });
  } catch (error) {
    console.error('Error in getRSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving RSVP',
      error: error.message
    });
  }
};

// PUT /api/rsvps/:id - Update RSVP
const updateRSVP = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rsvp = await RSVP.findById(req.params.id).populate('inviteId');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    // Check if user owns the invite
    if (rsvp.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this RSVP'
      });
    }

    const {
      guestName,
      guestEmail,
      status,
      requestedSeats,
      dietaryRestrictions,
      specialRequests
    } = req.body;

    if (guestName !== undefined) rsvp.guestName = guestName;
    if (guestEmail !== undefined) rsvp.guestEmail = guestEmail.toLowerCase();
    if (status !== undefined) rsvp.status = status;
    if (requestedSeats !== undefined) rsvp.requestedSeats = requestedSeats;
    if (dietaryRestrictions !== undefined) rsvp.dietaryRestrictions = dietaryRestrictions;
    if (specialRequests !== undefined) rsvp.specialRequests = specialRequests;

    await rsvp.save();

    res.json({
      success: true,
      rsvp
    });
  } catch (error) {
    console.error('Error in updateRSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating RSVP',
      error: error.message
    });
  }
};

// DELETE /api/rsvps/:id - Delete RSVP
const deleteRSVP = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rsvp = await RSVP.findById(req.params.id).populate('inviteId');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    // Check if user owns the invite
    if (rsvp.inviteId.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this RSVP'
      });
    }

    await rsvp.deleteOne();

    res.json({
      success: true,
      message: 'RSVP deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting RSVP',
      error: error.message
    });
  }
};

module.exports = {
  getRSVPs,
  getRSVP,
  updateRSVP,
  deleteRSVP
};
