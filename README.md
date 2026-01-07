# Party Admin Backend API

A comprehensive Node.js REST API for managing party invitations, RSVPs, and event details with Auth0 authentication, MongoDB storage, and email distribution capabilities.

## Features

- **User Authentication**: Auth0 JWT-based authentication
- **Invite Management**: Create, update, delete, and manage party invitations
- **RSVP System**: Guest response tracking with seat management
- **Things to Know**: Categorized recommendations (hotels, restaurants, attractions, etc.)
- **Template System**: Reusable invitation designs
- **Email Distribution**: Send invitations via email with QR codes
- **Public Access**: Shareable invitation links with unique tokens
- **Rate Limiting**: Email sending limits and API rate protection
- **Analytics**: Track views, unique visitors, and RSVP statistics

## Tech Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Auth0 with JWT
- **Email**: Nodemailer
- **QR Codes**: QRCode library
- **Security**: Helmet, CORS, express-rate-limit
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Auth0 account
- Email service (Gmail, SendGrid, etc.)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd party_admin_api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/party_admin

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.partyadmin.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Party Admin <noreply@partyadmin.com>

# Application URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001/api

# Rate Limiting
EMAIL_RATE_LIMIT=100
EMAIL_RATE_WINDOW_HOURS=1
```

## Running the Application

### Development Mode
```bash
# Run with hot reload (TypeScript)
npm run dev

# Type checking without building
npm run type-check

# Lint and format code
npm run lint
npm run format
```

### Production Mode
```bash
# Build TypeScript to JavaScript
npm run build

# Run production server
npm start
```

The API will be available at `http://localhost:3001`

## Development

For detailed development guidelines, TypeScript best practices, and code quality standards, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## API Endpoints

### Authentication

#### POST /api/auth/profile
Get or create user profile based on Auth0 JWT token.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "auth0Id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Invites

#### GET /api/invites
Get all invites for authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, completed, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### POST /api/invites
Create a new invite.

**Body:**
```json
{
  "eventName": "Birthday Party",
  "eventDate": "2024-12-31T20:00:00Z",
  "location": "123 Main St, City",
  "description": "Join us for a celebration!",
  "maxSeats": 50,
  "status": "draft",
  "design": {
    "primaryColor": "#4F46E5",
    "secondaryColor": "#F3F4F6",
    "fontFamily": "Inter",
    "headerImage": "",
    "backgroundPattern": "none"
  }
}
```

#### GET /api/invites/:id
Get single invite by ID.

#### PUT /api/invites/:id
Update an invite.

#### DELETE /api/invites/:id
Delete an invite (cascades to RSVPs and Things to Know).

#### POST /api/invites/:id/send
Send invite emails.

**Body:**
```json
{
  "emails": ["guest1@example.com", "guest2@example.com"]
}
```

#### GET /api/invites/:id/stats
Get invite statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "viewCount": 42,
    "uniqueVisitors": 30,
    "totalRsvps": 25,
    "confirmed": 20,
    "declined": 3,
    "pending": 2,
    "totalSeatsRequested": 45,
    "maxSeats": 50,
    "seatsAvailable": 5
  }
}
```

### Public Endpoints (No Authentication Required)

#### GET /api/invites/public/:token
Get public invite by token.

**Headers:**
- `x-visitor-id` (optional): Unique visitor identifier for tracking

#### POST /api/invites/public/:token/rsvp
Submit RSVP for an invite.

**Body:**
```json
{
  "guestName": "Jane Doe",
  "guestEmail": "jane@example.com",
  "status": "confirmed",
  "requestedSeats": 2,
  "dietaryRestrictions": "Vegetarian",
  "specialRequests": "Window seat please"
}
```

### QR Codes

#### GET /api/invites/:id/qr
Generate QR code for invite (PNG image).

### RSVPs

#### GET /api/invites/:id/rsvps
Get all RSVPs for an invite.

**Query Parameters:**
- `status` (optional): Filter by status (confirmed, declined, pending)

#### GET /api/rsvps/:id
Get single RSVP by ID.

#### PUT /api/rsvps/:id
Update an RSVP.

#### DELETE /api/rsvps/:id
Delete an RSVP.

### Things to Know

#### GET /api/invites/:id/things-to-know
Get all things to know for an invite.

**Query Parameters:**
- `category` (optional): Filter by category (hotels, restaurants, attractions, transportation, other)

#### POST /api/invites/:id/things-to-know
Create a new thing to know.

**Body:**
```json
{
  "category": "hotels",
  "title": "Grand Hotel",
  "description": "Luxury hotel near venue",
  "url": "https://grandhotel.com",
  "address": "456 Park Ave",
  "phone": "+1-555-1234"
}
```

#### GET /api/things-to-know/:id
Get single thing to know by ID.

#### PUT /api/things-to-know/:id
Update a thing to know.

#### DELETE /api/things-to-know/:id
Delete a thing to know.

#### POST /api/invites/:id/things-to-know/reorder
Reorder things to know.

**Body:**
```json
{
  "orderedIds": ["id1", "id2", "id3"]
}
```

### Templates

#### GET /api/templates
Get all templates (public + user's own).

#### POST /api/templates
Create a new template.

**Body:**
```json
{
  "name": "Elegant Birthday",
  "description": "Elegant design for birthday parties",
  "design": {
    "primaryColor": "#8B5CF6",
    "secondaryColor": "#F3E8FF",
    "fontFamily": "Playfair Display",
    "headerImage": "",
    "backgroundPattern": "confetti"
  },
  "isPublic": false,
  "previewImage": ""
}
```

#### GET /api/templates/:id
Get single template by ID.

#### PUT /api/templates/:id
Update a template.

#### DELETE /api/templates/:id
Delete a template.

## Data Models

### User
- `auth0Id`: String (unique)
- `email`: String (unique)
- `name`: String
- `picture`: String
- `timestamps`: createdAt, updatedAt

### Invite
- `userId`: Reference to User
- `eventName`: String
- `eventDate`: Date
- `location`: String
- `description`: String
- `maxSeats`: Number
- `status`: Enum (draft, active, completed, cancelled)
- `design`: InviteDesign object
- `publicToken`: String (unique, auto-generated)
- `viewCount`: Number
- `uniqueVisitors`: Array of strings
- `lastEmailSent`: Date
- `emailSentCount`: Number
- `timestamps`: createdAt, updatedAt

### RSVP
- `inviteId`: Reference to Invite
- `guestName`: String
- `guestEmail`: String
- `status`: Enum (confirmed, declined, pending)
- `requestedSeats`: Number
- `dietaryRestrictions`: String
- `specialRequests`: String
- `respondedAt`: Date
- `timestamps`: createdAt, updatedAt

### ThingToKnow
- `inviteId`: Reference to Invite
- `category`: Enum (hotels, restaurants, attractions, transportation, other)
- `title`: String
- `description`: String
- `url`: String
- `address`: String
- `phone`: String
- `order`: Number
- `timestamps`: createdAt, updatedAt

### Template
- `name`: String
- `description`: String
- `design`: InviteDesign object
- `isPublic`: Boolean
- `userId`: Reference to User (null for public templates)
- `previewImage`: String
- `timestamps`: createdAt, updatedAt

## Rate Limiting

- **Email Sending**: 100 emails per hour per invite (configurable)
- **API Requests**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 20 requests per 15 minutes per IP

## Security Features

- **JWT Authentication**: All protected routes require valid Auth0 JWT
- **Helmet**: Security headers for Express
- **CORS**: Cross-origin resource sharing enabled
- **Input Validation**: Email validation and data sanitization
- **Rate Limiting**: Protection against abuse
- **Cascade Delete**: Automatic cleanup of related data

## Email Templates

The API includes responsive HTML email templates with:
- Event details
- QR code for easy RSVP
- Direct link to invitation
- Customizable colors and fonts based on invite design

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Development

### Project Structure
```
party_admin_api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inviteController.js
│   │   ├── publicController.js
│   │   ├── rsvpController.js
│   │   ├── templateController.js
│   │   └── thingToKnowController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── Invite.js
│   │   ├── RSVP.js
│   │   ├── Template.js
│   │   ├── ThingToKnow.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── invites.js
│   │   ├── public.js
│   │   ├── rsvps.js
│   │   ├── templates.js
│   │   └── thingsToKnow.js
│   ├── utils/
│   │   ├── emailService.js
│   │   └── qrCodeService.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
