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

// Middleware imports
import { errorHandler } from './middleware/error.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pages', pageRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('E-Waste Management API is running');
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});