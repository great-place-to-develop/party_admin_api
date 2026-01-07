import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Extend Express Request to include auth and userId
export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  userId?: string;
}

// User Document Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  auth0Id: string;
  email: string;
  name: string;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invite Design Interface
export interface IInviteDesign {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerImage: string;
  backgroundPattern: string;
}

// Invite Document Interface
export interface IInvite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  eventName: string;
  eventDate: Date;
  location: string;
  description: string;
  maxSeats: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  design: IInviteDesign;
  publicToken: string;
  viewCount: number;
  uniqueVisitors: string[];
  lastEmailSent: Date | null;
  emailSentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// RSVP Document Interface
export interface IRSVP extends Document {
  _id: Types.ObjectId;
  inviteId: Types.ObjectId;
  guestName: string;
  guestEmail: string;
  status: 'confirmed' | 'declined' | 'pending';
  requestedSeats: number;
  dietaryRestrictions: string;
  specialRequests: string;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ThingToKnow Document Interface
export interface IThingToKnow extends Document {
  _id: Types.ObjectId;
  inviteId: Types.ObjectId;
  category: 'hotels' | 'restaurants' | 'attractions' | 'transportation' | 'other';
  title: string;
  description: string;
  url: string;
  address: string;
  phone: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Template Document Interface
export interface ITemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  design: IInviteDesign;
  isPublic: boolean;
  userId: Types.ObjectId | null;
  previewImage: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email Service Types
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

// Rate Limiter Types
export interface RateLimitResult {
  limited: boolean;
  resetTime?: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Stats Types
export interface InviteStats {
  viewCount: number;
  uniqueVisitors: number;
  totalRsvps: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalSeatsRequested: number;
  maxSeats: number;
  seatsAvailable: number;
}
