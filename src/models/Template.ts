import mongoose, { Schema } from 'mongoose';
import { ITemplate, IInviteDesign } from '../types';

const templateDesignSchema = new Schema<IInviteDesign>(
  {
    primaryColor: { type: String, default: '#4F46E5' },
    secondaryColor: { type: String, default: '#F3F4F6' },
    fontFamily: { type: String, default: 'Inter' },
    headerImage: { type: String, default: '' },
    backgroundPattern: { type: String, default: 'none' },
  },
  { _id: false }
);

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    design: {
      type: templateDesignSchema,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    previewImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying public templates and user-specific templates
templateSchema.index({ isPublic: 1, userId: 1 });

export default mongoose.model<ITemplate>('Template', templateSchema);
