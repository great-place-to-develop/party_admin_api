import mongoose, { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import { IInvite, IInviteDesign } from '../types';

const inviteDesignSchema = new Schema<IInviteDesign>(
  {
    primaryColor: { type: String, default: '#4F46E5' },
    secondaryColor: { type: String, default: '#F3F4F6' },
    fontFamily: { type: String, default: 'Inter' },
    headerImage: { type: String, default: '' },
    backgroundPattern: { type: String, default: 'none' },
  },
  { _id: false }
);

const inviteSchema = new Schema<IInvite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    maxSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    design: {
      type: inviteDesignSchema,
      default: () => ({}),
    },
    publicToken: {
      type: String,
      unique: true,
      index: true,
      default: () => nanoid(10),
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: [String],
      default: [],
    },
    lastEmailSent: {
      type: Date,
      default: null,
    },
    emailSentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
inviteSchema.index({ userId: 1, status: 1 });
inviteSchema.index({ publicToken: 1 });

// Cascade delete RSVPs and ThingsToKnow when invite is deleted
inviteSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('RSVP').deleteMany({ inviteId: this._id });
  await mongoose.model('ThingToKnow').deleteMany({ inviteId: this._id });
});

export default mongoose.model<IInvite>('Invite', inviteSchema);
