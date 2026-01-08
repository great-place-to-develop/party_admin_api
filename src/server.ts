require('dotenv').config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import inviteRoutes from './routes/invites';
import publicRoutes from './routes/public';
import rsvpRoutes from './routes/rsvps';
import thingsToKnowRoutes from './routes/thingsToKnow';
import templateRoutes from './routes/templates';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Party Admin API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api', publicRoutes);
app.use('/api/rsvps', rsvpRoutes);
app.use('/api/things-to-know', thingsToKnowRoutes);
app.use('/api/invites', rsvpRoutes); // Mount RSVP routes under invites as well
app.use('/api/invites', thingsToKnowRoutes); // Mount things-to-know routes under invites as well
app.use('/api/templates', templateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing authentication token',
      error: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field: ${field}`
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   Party Admin API Server Started      ║
  ╠════════════════════════════════════════╣
  ║   Port: ${PORT}                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ║   API Base: http://localhost:${PORT}/api  ║
  ╚════════════════════════════════════════╝
  `);
});

export default app;
