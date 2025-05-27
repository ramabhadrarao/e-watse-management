// server/middleware/auth.js
// FIXED: Enhanced auth middleware with better error handling and logging

import jwt from 'jsonwebtoken';
import { asyncHandler } from './async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import User from '../models/User.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    console.log(`❌ Auth failed for ${req.method} ${req.originalUrl}: No token provided`);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user to req.user
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log(`❌ Auth failed for ${req.method} ${req.originalUrl}: User not found for token`);
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Check if user is active
    if (!req.user.isActive) {
      console.log(`❌ Auth failed for ${req.method} ${req.originalUrl}: User account deactivated (${req.user.email})`);
      return next(new ErrorResponse('User account is deactivated', 401));
    }

    console.log(`✅ Auth success for ${req.method} ${req.originalUrl}: ${req.user.email} (${req.user.role})`);
    next();
  } catch (err) {
    console.log(`❌ Auth failed for ${req.method} ${req.originalUrl}: Invalid token - ${err.message}`);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Authorization failed for ${req.method} ${req.originalUrl}: Role ${req.user.role} not in allowed roles: [${roles.join(', ')}]`);
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    console.log(`✅ Authorization success for ${req.method} ${req.originalUrl}: Role ${req.user.role} authorized`);
    next();
  };
};