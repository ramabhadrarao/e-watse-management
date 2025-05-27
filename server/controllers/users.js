// server/controllers/users.js
// User management controller for admin operations

import User from '../models/User.js';
import { asyncHandler } from '../middleware/async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { emailService } from '../services/emailService.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Manager
export const getUsers = asyncHandler(async (req, res, next) => {
  const { role, page = 1, limit = 10, search, status } = req.query;

  let query = User.find();

  // Filter by role
  if (role && role !== 'all') {
    query = query.where({ role });
  }

  // Filter by status
  if (status !== undefined) {
    query = query.where({ isActive: status === 'active' });
  }

  // Search functionality
  if (search) {
    query = query.where({
      $or: [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ]
    });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const total = await User.countDocuments(query.getQuery());

  const users = await query
    .select('-password') // Exclude password
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(Number(limit));

  // Pagination result
  const pagination = {};
  if (startIndex + Number(limit) < total) {
    pagination.next = { page: Number(page) + 1, limit: Number(limit) };
  }
  if (startIndex > 0) {
    pagination.prev = { page: Number(page) - 1, limit: Number(limit) };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Manager
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const userData = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const user = await User.create(userData);

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/Manager
export const updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = { ...req.body };
  
  // Don't allow password update through this endpoint
  delete fieldsToUpdate.password;

  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Soft delete by deactivating
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Activate/Deactivate user
// @route   PUT /api/users/:id/status
// @access  Private/Admin/Manager
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.isActive = isActive;
  await user.save();

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin/Manager
export const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'pickup_boy' }),
    User.countDocuments({ role: 'manager' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ 
      createdAt: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
      } 
    }) // New users in last 30 days
  ]);

  const [customers, pickupBoys, managers, admins, activeUsers, inactiveUsers, newUsers] = stats;

  res.status(200).json({
    success: true,
    data: {
      totalUsers: customers + pickupBoys + managers + admins,
      customers,
      pickupBoys,
      managers,
      admins,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth: newUsers
    }
  });
});

// @desc    Get pickup boys for assignment
// @route   GET /api/users/pickup-boys
// @access  Private/Admin/Manager
export const getPickupBoys = asyncHandler(async (req, res, next) => {
  const { pincode } = req.query;

  let query = User.find({ 
    role: 'pickup_boy', 
    isActive: true 
  });

  // If pincode is provided, we might want to filter by location
  // This would require additional logic based on your pincode assignment system

  const pickupBoys = await query.select('firstName lastName phone email address');

  res.status(200).json({
    success: true,
    count: pickupBoys.length,
    data: pickupBoys
  });
});

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new ErrorResponse('Password must be at least 6 characters', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.password = newPassword;
  await user.save();

  // Send password reset notification email
  try {
    await emailService.sendCustomEmail(
      user.email,
      'Password Reset Notification',
      `
        <h2>Password Reset</h2>
        <p>Your password has been reset by an administrator.</p>
        <p>Your new temporary password is: <strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
      `
    );
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    Send custom notification to user
// @route   POST /api/users/:id/notify
// @access  Private/Admin/Manager
export const notifyUser = asyncHandler(async (req, res, next) => {
  const { subject, message } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  try {
    await emailService.sendCustomEmail(user.email, subject, message);
    
    res.status(200).json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to send notification', 500));
  }
});