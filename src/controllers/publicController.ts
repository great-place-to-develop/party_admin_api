import { Request, Response } from 'express';
import Invite from '../models/Invite';
import RSVP from '../models/RSVP';
import ThingToKnow from '../models/ThingToKnow';
import { generateQRCodeBuffer } from '../utils/qrCodeService';

// GET /api/invites/public/:token - Get public invite by token
export const getPublicInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const visitorId = req.headers['x-visitor-id'] || req.ip;

    const invite = await Invite.findOne({
      publicToken: token,
      status: { $in: ['active', 'completed'] }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found or not active'
      });
    }

    // Track view
    invite.viewCount += 1;

    // Track unique visitor
    if (!invite.uniqueVisitors.includes(visitorId)) {
      invite.uniqueVisitors.push(visitorId);
    }

    await invite.save();

    // Get things to know for this invite
    const thingsToKnow = await ThingToKnow.find({ inviteId: invite._id })
      .sort({ order: 1 });

    res.json({
      success: true,
      invite: {
        id: invite._id,
        eventName: invite.eventName,
        eventDate: invite.eventDate,
        location: invite.location,
        description: invite.description,
        maxSeats: invite.maxSeats,
        design: invite.design,
        thingsToKnow
      }
    });
  } catch (error) {
    console.error('Error in getPublicInvite:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/invites/public/:token/rsvp - Submit RSVP
export const submitRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const {
      guestName,
      guestEmail,
      status,
      requestedSeats,
      dietaryRestrictions,
      specialRequests
    } = req.body;

    const invite = await Invite.findOne({
      publicToken: token,
      status: 'active'
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found or not accepting RSVPs'
      });
    }

    // Validate required fields
    if (!guestName || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'Guest name and email are required'
      });
    }

    // Check if RSVP already exists
    let rsvp = await RSVP.findOne({
      inviteId: invite._id,
      guestEmail: guestEmail.toLowerCase()
    });

    if (rsvp) {
      // Update existing RSVP
      rsvp.guestName = guestName;
      rsvp.status = status || 'confirmed';
      rsvp.requestedSeats = requestedSeats || 1;
      rsvp.dietaryRestrictions = dietaryRestrictions || '';
      rsvp.specialRequests = specialRequests || '';
      rsvp.respondedAt = new Date();
    } else {
      // Create new RSVP
      rsvp = new RSVP({
        inviteId: invite._id,
        guestName,
        guestEmail: guestEmail.toLowerCase(),
        status: status || 'confirmed',
        requestedSeats: requestedSeats || 1,
        dietaryRestrictions: dietaryRestrictions || '',
        specialRequests: specialRequests || '',
        respondedAt: new Date()
      });
    }

    // Check if there are enough seats available (only for confirmed RSVPs)
    if (rsvp.status === 'confirmed') {
      const confirmedRsvps = await RSVP.find({
        inviteId: invite._id,
        status: 'confirmed',
        _id: { $ne: rsvp._id }
      });

      const seatsUsed = confirmedRsvps.reduce((sum, r) => sum + r.requestedSeats, 0);
      const seatsAvailable = invite.maxSeats - seatsUsed;

      if (rsvp.requestedSeats > seatsAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Not enough seats available',
          seatsAvailable
        });
      }
    }

    await rsvp.save();

    res.json({
      success: true,
      message: 'RSVP submitted successfully',
      rsvp: {
        id: rsvp._id,
        guestName: rsvp.guestName,
        guestEmail: rsvp.guestEmail,
        status: rsvp.status,
        requestedSeats: rsvp.requestedSeats,
        respondedAt: rsvp.respondedAt
      }
    });
  } catch (error) {
    console.error('Error in submitRSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting RSVP',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/invites/:id/qr - Generate QR code for invite
export const getInviteQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const invite = await Invite.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    const publicUrl = `${process.env.FRONTEND_URL}/invite/${invite.publicToken}`;
    const qrCodeBuffer = await generateQRCodeBuffer(publicUrl);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="invite-${invite.publicToken}.png"`);
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error in getInviteQRCode:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
