import mongoose, { Schema } from 'mongoose';
import { IRSVP } from '../types';

const rsvpSchema = new Schema<IRSVP>(
  {
    inviteId: {
      type: Schema.Types.ObjectId,
      ref: 'Invite',
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'declined', 'pending'],
      default: 'pending',
    },
    requestedSeats: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    dietaryRestrictions: {
      type: String,
      default: '',
      trim: true,
    },
    specialRequests: {
      type: String,
      default: '',
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for efficient querying
rsvpSchema.index({ inviteId: 1, guestEmail: 1 }, { unique: true });
rsvpSchema.index({ inviteId: 1, status: 1 });

export default mongoose.model<IRSVP>('RSVP', rsvpSchema);
