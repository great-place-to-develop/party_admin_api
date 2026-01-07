# Development Guide

## Overview

This project is built with TypeScript, Node.js, Express, and MongoDB. This guide covers development setup, coding standards, and best practices.

## Technology Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Auth0 with JWT
- **Code Quality**: ESLint + Prettier
- **Package Manager**: npm

## Getting Started

### Prerequisites

```bash
node >= 14.0.0
npm >= 6.0.0
mongodb >= 4.4.0
```

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure .env with your credentials
```

### Development Scripts

```bash
# Development with hot reload
npm run dev

# Type checking only (no build)
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Formatting
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Project Structure

```
party_admin_api/
├── src/
│   ├── config/           # Database and app configuration
│   │   └── database.ts
│   ├── controllers/      # Request handlers
│   │   ├── authController.ts
│   │   ├── inviteController.ts
│   │   ├── publicController.ts
│   │   ├── rsvpController.ts
│   │   ├── templateController.ts
│   │   └── thingToKnowController.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   └── rateLimiter.ts
│   ├── models/           # Mongoose models
│   │   ├── Invite.ts
│   │   ├── RSVP.ts
│   │   ├── Template.ts
│   │   ├── ThingToKnow.ts
│   │   └── User.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── invites.ts
│   │   ├── public.ts
│   │   ├── rsvps.ts
│   │   ├── templates.ts
│   │   └── thingsToKnow.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── emailService.ts
│   │   └── qrCodeService.ts
│   └── server.ts         # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── nodemon.json          # Nodemon configuration
└── package.json
```

## TypeScript Guidelines

### Type Safety

- **Strict mode enabled**: All strict TypeScript checks are active
- **No implicit any**: Always define types explicitly
- **Null checks**: Handle null/undefined cases
- **Function returns**: Specify return types for functions

### Type Definitions

All TypeScript interfaces and types are defined in `src/types/index.ts`:

```typescript
import { AuthRequest, IUser, IInvite, IRSVP } from '../types';
```

### Example Patterns

#### Controllers

```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';

export const myController = async (req: AuthRequest, res: Response) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};
```

#### Models

```typescript
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  // schema definition
});

export default mongoose.model<IUser>('User', userSchema);
```

## Code Quality

### ESLint

ESLint is configured with TypeScript-specific rules:

- **@typescript-eslint/recommended**: TypeScript best practices
- **Prettier integration**: Auto-formatting on lint
- **No-console**: Allowed (for logging)
- **No floating promises**: Must handle async operations

Run linting:

```bash
npm run lint          # Check issues
npm run lint:fix      # Auto-fix
```

### Prettier

Prettier enforces consistent code formatting:

- **Single quotes**: Use single quotes for strings
- **Semicolons**: Always use semicolons
- **Print width**: 100 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 style

Run formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check without changes
```

### Pre-commit Hooks (Optional)

Install Husky for automatic linting/formatting:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

## Environment Variables

All environment variables are typed and validated:

```typescript
// Required variables
process.env.MONGODB_URI          // MongoDB connection string
process.env.AUTH0_DOMAIN         // Auth0 domain
process.env.AUTH0_AUDIENCE       // Auth0 API identifier
process.env.EMAIL_HOST           // SMTP host
process.env.EMAIL_PORT           // SMTP port
process.env.EMAIL_USER           // SMTP username
process.env.EMAIL_PASSWORD       // SMTP password
process.env.EMAIL_FROM           // From email address
process.env.FRONTEND_URL         // Frontend application URL

// Optional variables
process.env.PORT                 // Server port (default: 3001)
process.env.NODE_ENV             // Environment (development/production)
process.env.EMAIL_RATE_LIMIT     // Email rate limit (default: 100)
```

## API Development

### Adding New Endpoints

1. **Define types** in `src/types/index.ts`:

```typescript
export interface INewFeature extends Document {
  // your fields
}
```

2. **Create model** in `src/models/`:

```typescript
import mongoose, { Schema } from 'mongoose';
import { INewFeature } from '../types';

const schema = new Schema<INewFeature>({
  // schema definition
});

export default mongoose.model<INewFeature>('Feature', schema);
```

3. **Create controller** in `src/controllers/`:

```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';

export const getFeature = async (req: AuthRequest, res: Response) => {
  // implementation
};
```

4. **Create routes** in `src/routes/`:

```typescript
import express from 'express';
import { checkJwt, attachUserId } from '../middleware/auth';
import { getFeature } from '../controllers/featureController';

const router = express.Router();

router.get('/', checkJwt, attachUserId, getFeature);

export default router;
```

5. **Register routes** in `src/server.ts`:

```typescript
import featureRoutes from './routes/feature';

app.use('/api/feature', featureRoutes);
```

### Request/Response Patterns

Always use consistent patterns:

```typescript
// Success response
res.json({
  success: true,
  data: result,
});

// Error response
res.status(400).json({
  success: false,
  message: 'Error description',
  error: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
});

// Paginated response
res.json({
  success: true,
  data: results,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10,
  },
});
```

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

Create test files with `.spec.ts` or `.test.ts` extension:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

## Database

### Mongoose Patterns

```typescript
// Finding documents
const user = await User.findOne({ auth0Id: 'auth0|123' });

// Creating documents
const newUser = new User({ auth0Id, email, name });
await newUser.save();

// Updating documents
user.name = 'New Name';
await user.save();

// Deleting documents
await user.deleteOne();

// Population
const invite = await Invite.findById(id).populate('userId');
```

### Indexing

Always add indexes for frequently queried fields:

```typescript
schema.index({ userId: 1, status: 1 });
schema.index({ email: 1 }, { unique: true });
```

## Authentication

### Protecting Routes

```typescript
import { checkJwt, attachUserId } from '../middleware/auth';

// Require authentication
router.get('/protected', checkJwt, attachUserId, handler);

// Public route
router.get('/public', handler);
```

### Accessing User Info

```typescript
export const handler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId; // Auth0 sub claim
  const userEmail = req.auth?.email; // User email from token
};
```

## Error Handling

### Global Error Handler

All errors are caught by the global error handler in `server.ts`:

```typescript
app.use((err, req, res, next) => {
  // Handles JWT errors, validation errors, etc.
});
```

### Custom Error Handling

```typescript
try {
  // Your logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Operation failed',
    error: (error as Error).message,
  });
}
```

## Performance

### Rate Limiting

```typescript
import { apiLimiter, authLimiter } from '../middleware/rateLimiter';

app.use('/api/', apiLimiter); // 100 requests per 15 min
app.use('/api/auth', authLimiter); // 20 requests per 15 min
```

### Caching

Implement caching for frequently accessed data:

```typescript
// Example: Cache templates
const cachedTemplates = await redis.get('templates');
if (cachedTemplates) {
  return JSON.parse(cachedTemplates);
}
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Debugging Tips

- Use `console.log()` for quick debugging
- Use VS Code breakpoints for step-through debugging
- Check MongoDB logs for database issues
- Use Morgan for HTTP request logging

## Deployment

### Building for Production

```bash
# Build TypeScript
npm run build

# The dist/ folder contains compiled JavaScript
# Deploy the dist/ folder along with package.json
```

### Production Environment

```bash
# Install production dependencies only
npm install --production

# Start server
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- Use environment-specific `.env` files
- Never commit `.env` files to git
- Use secret management tools for sensitive data

## Common Issues

### TypeScript Errors

**Issue**: "Cannot find module"
**Solution**: Check import paths and ensure types are exported

**Issue**: "Type 'X' is not assignable to type 'Y'"
**Solution**: Add proper type assertions or fix the type definition

### MongoDB Connection

**Issue**: "MongoError: Authentication failed"
**Solution**: Check MongoDB URI and credentials

**Issue**: "MongoError: Topology closed"
**Solution**: Restart MongoDB service

### Auth0 Issues

**Issue**: "Invalid token"
**Solution**: Check AUTH0_DOMAIN and AUTH0_AUDIENCE in .env

**Issue**: "jwksUri must be provided"
**Solution**: Ensure AUTH0_DOMAIN is set correctly

## Best Practices

1. **Always use TypeScript types** - No `any` types
2. **Handle errors properly** - Use try-catch blocks
3. **Validate input** - Check request data before processing
4. **Use async/await** - Avoid callback hell
5. **Keep functions small** - Single responsibility principle
6. **Comment complex logic** - Make code self-documenting
7. **Use environment variables** - Never hardcode secrets
8. **Test your code** - Write unit and integration tests
9. **Follow naming conventions** - camelCase for variables, PascalCase for types
10. **Keep dependencies updated** - Regularly update npm packages

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Auth0 Node.js Quickstart](https://auth0.com/docs/quickstart/backend/nodejs)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint:fix` and `npm run format`
4. Test your changes locally
5. Create a pull request
6. Wait for code review

## Support

For issues or questions:
- Check this development guide
- Review the main README.md
- Open an issue on GitHub
