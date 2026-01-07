import Invite from '../models/Invite';
import RSVP from '../models/RSVP';
import User from '../models/User';
import { sendInviteEmail, isValidEmail } from '../utils/emailService';
import { generateQRCode } from '../utils/qrCodeService';
import { emailRateLimiter } from '../middleware/rateLimiter';

// GET /api/invites - Get all invites for authenticated user
const getInvites = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: user._id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invites = await Invite.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invite.countDocuments(query);

    res.json({
      success: true,
      invites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getInvites:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invites',
      error: error.message
    });
  }
};

// GET /api/invites/:id - Get single invite
const getInvite = async (req, res) => {
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

    res.json({
      success: true,
      invite
    });
  } catch (error) {
    console.error('Error in getInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invite',
      error: error.message
    });
  }
};

// POST /api/invites - Create new invite
const createInvite = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      eventName,
      eventDate,
      location,
      description,
      maxSeats,
      status,
      design
    } = req.body;

    const invite = new Invite({
      userId: user._id,
      eventName,
      eventDate,
      location,
      description,
      maxSeats,
      status: status || 'draft',
      design: design || {}
    });

    await invite.save();

    res.status(201).json({
      success: true,
      invite
    });
  } catch (error) {
    console.error('Error in createInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invite',
      error: error.message
    });
  }
};

// PUT /api/invites/:id - Update invite
const updateInvite = async (req, res) => {
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
      eventName,
      eventDate,
      location,
      description,
      maxSeats,
      status,
      design
    } = req.body;

    if (eventName !== undefined) invite.eventName = eventName;
    if (eventDate !== undefined) invite.eventDate = eventDate;
    if (location !== undefined) invite.location = location;
    if (description !== undefined) invite.description = description;
    if (maxSeats !== undefined) invite.maxSeats = maxSeats;
    if (status !== undefined) invite.status = status;
    if (design !== undefined) invite.design = { ...invite.design, ...design };

    await invite.save();

    res.json({
      success: true,
      invite
    });
  } catch (error) {
    console.error('Error in updateInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invite',
      error: error.message
    });
  }
};

// DELETE /api/invites/:id - Delete invite
const deleteInvite = async (req, res) => {
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

    // Cascade delete will be handled by pre-deleteOne hook
    await invite.deleteOne();

    res.json({
      success: true,
      message: 'Invite and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invite',
      error: error.message
    });
  }
};

// POST /api/invites/:id/send - Send invite emails
const sendInvite = async (req, res) => {
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

    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of email addresses'
      });
    }

    // Validate emails
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses',
        invalidEmails
      });
    }

    // Check rate limit
    const rateLimitCheck = emailRateLimiter(invite);
    if (rateLimitCheck.limited) {
      return res.status(429).json({
        success: false,
        message: 'Email rate limit exceeded',
        resetTime: rateLimitCheck.resetTime
      });
    }

    // Check if adding these emails would exceed rate limit
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const emailRateLimit = parseInt(process.env.EMAIL_RATE_LIMIT) || 100;

    let emailCount = 0;
    if (invite.lastEmailSent && (now - new Date(invite.lastEmailSent).getTime()) < oneHour) {
      emailCount = invite.emailSentCount || 0;
    }

    if (emailCount + emails.length > emailRateLimit) {
      return res.status(429).json({
        success: false,
        message: `Cannot send ${emails.length} emails. Only ${emailRateLimit - emailCount} remaining in current hour.`,
        remainingQuota: emailRateLimit - emailCount
      });
    }

    // Generate public URL and QR code
    const publicUrl = `${process.env.FRONTEND_URL}/invite/${invite.publicToken}`;
    const qrCodeDataUrl = await generateQRCode(publicUrl);

    // Send emails
    const results = [];
    for (const email of emails) {
      const result = await sendInviteEmail(email, invite, publicUrl, qrCodeDataUrl);
      results.push({ email, ...result });
    }

    // Update invite email tracking
    const successfulSends = results.filter(r => r.success).length;
    if (successfulSends > 0) {
      if (!invite.lastEmailSent || (now - new Date(invite.lastEmailSent).getTime()) >= oneHour) {
        invite.emailSentCount = successfulSends;
      } else {
        invite.emailSentCount += successfulSends;
      }
      invite.lastEmailSent = new Date();
      await invite.save();
    }

    const failed = results.filter(r => !r.success);

    res.json({
      success: true,
      message: `Sent ${successfulSends} of ${emails.length} emails`,
      results,
      failed: failed.length > 0 ? failed : undefined
    });
  } catch (error) {
    console.error('Error in sendInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invites',
      error: error.message
    });
  }
};

// GET /api/invites/:id/stats - Get invite statistics
const getInviteStats = async (req, res) => {
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

    // Get RSVP statistics
    const rsvps = await RSVP.find({ inviteId: invite._id });

    const stats = {
      viewCount: invite.viewCount,
      uniqueVisitors: invite.uniqueVisitors.length,
      totalRsvps: rsvps.length,
      confirmed: rsvps.filter(r => r.status === 'confirmed').length,
      declined: rsvps.filter(r => r.status === 'declined').length,
      pending: rsvps.filter(r => r.status === 'pending').length,
      totalSeatsRequested: rsvps
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.requestedSeats, 0),
      maxSeats: invite.maxSeats,
      seatsAvailable: invite.maxSeats - rsvps
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.requestedSeats, 0)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in getInviteStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invite statistics',
      error: error.message
    });
  }
};

export default {
  getInvites,
  getInvite,
  createInvite,
  updateInvite,
  deleteInvite,
  sendInvite,
  getInviteStats
};
