const rateLimit = require('express-rate-limit');

// Email rate limiter - 100 emails per hour per invite
const emailRateLimiter = (invite) => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const emailRateLimit = parseInt(process.env.EMAIL_RATE_LIMIT) || 100;

  if (invite.lastEmailSent && (now - new Date(invite.lastEmailSent).getTime()) < oneHour) {
    const emailsSentInWindow = invite.emailSentCount || 0;
    if (emailsSentInWindow >= emailRateLimit) {
      const resetTime = new Date(new Date(invite.lastEmailSent).getTime() + oneHour);
      return {
        limited: true,
        resetTime: resetTime
      };
    }
  }

  return { limited: false };
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  emailRateLimiter,
  apiLimiter,
  authLimiter
};
