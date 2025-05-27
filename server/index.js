// server/index.js
// Enhanced server configuration with new routes and dependencies

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pincodeRoutes from './routes/pincodes.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import pageRoutes from './routes/pages.js';
import supportRoutes from './routes/support.js';

// Middleware imports
import { errorHandler } from './middleware/error.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB with options to suppress warnings
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Suppress mongoose duplicate index warning
mongoose.set('strictQuery', false);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Home route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'E-Waste Management API is running',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      categories: '/api/categories',
      orders: '/api/orders',
      pincodes: '/api/pincodes',
      pages: '/api/pages',
      support: '/api/support'
    },
    features: [
      'Email notifications',
      'PDF receipt generation',
      'Support ticket system',
      'User management',
      'Real-time order tracking'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/support', supportRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});