import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        email: string;
        name: string;
        picture?: string;
        [key: string]: unknown;
      };
      userId?: string;
    }
  }
}
