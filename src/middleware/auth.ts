import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

// Auth0 JWT validation middleware
export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as any,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Middleware to attach user ID from Auth0 sub claim
export const attachUserId = (req: Request, res: Response, next: NextFunction): void => {
  if (req.auth && req.auth.sub) {
    req.userId = req.auth.sub;
  }
  next();
};
