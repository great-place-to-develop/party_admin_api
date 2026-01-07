import mongoose, { Schema } from 'mongoose';
import { IThingToKnow } from '../types';

const thingToKnowSchema = new Schema<IThingToKnow>(
  {
    inviteId: {
      type: Schema.Types.ObjectId,
      ref: 'Invite',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['hotels', 'restaurants', 'attractions', 'transportation', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient ordering and querying
thingToKnowSchema.index({ inviteId: 1, order: 1 });
thingToKnowSchema.index({ inviteId: 1, category: 1 });

export default mongoose.model<IThingToKnow>('ThingToKnow', thingToKnowSchema);
