// server/controllers/users.js
// UPDATED: Enhanced user management controller with pickup boy availability and assignment features

import User from '../models/User.js';
import Order from '../models/Order.js';
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
  const { pincode, city } = req.query;

  let query = User.find({ 
    role: 'pickup_boy', 
    isActive: true 
  });

  // Filter by location if provided
  if (pincode) {
    query = query.where({ 'address.pincode': pincode });
  }
  if (city) {
    query = query.where({ 'address.city': new RegExp(city, 'i') });
  }

  const pickupBoys = await query.select('firstName lastName phone email address');

  res.status(200).json({
    success: true,
    count: pickupBoys.length,
    data: pickupBoys
  });
});

// @desc    Get pickup boys with workload and availability info
// @route   GET /api/users/pickup-boys/availability
// @access  Private/Admin/Manager
export const getPickupBoyAvailability = asyncHandler(async (req, res, next) => {
  const { pincode, city, date } = req.query;

  let query = User.find({ 
    role: 'pickup_boy', 
    isActive: true 
  });

  // Filter by location if provided
  if (pincode) {
    query = query.where({ 'address.pincode': pincode });
  }
  if (city) {
    query = query.where({ 'address.city': new RegExp(city, 'i') });
  }

  const pickupBoys = await query.select('firstName lastName phone email address');

  // Get current workload for each pickup boy
  const pickupBoysWithWorkload = await Promise.all(
    pickupBoys.map(async (pickupBoy) => {
      // Count active orders (assigned, in_transit, picked_up)
      const activeOrders = await Order.countDocuments({
        assignedPickupBoy: pickupBoy._id,
        status: { $in: ['assigned', 'in_transit', 'picked_up'] }
      });

      // Count today's orders
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayOrders = await Order.countDocuments({
        assignedPickupBoy: pickupBoy._id,
        'pickupDetails.preferredDate': {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      // Count completed orders this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const weekCompletedOrders = await Order.countDocuments({
        assignedPickupBoy: pickupBoy._id,
        status: 'completed',
        updatedAt: { $gte: startOfWeek }
      });

      // Calculate availability status
      let availabilityStatus = 'available';
      if (activeOrders >= 8) {
        availabilityStatus = 'overloaded';
      } else if (activeOrders >= 5) {
        availabilityStatus = 'busy';
      } else if (activeOrders >= 3) {
        availabilityStatus = 'moderate';
      }

      return {
        ...pickupBoy.toObject(),
        workload: {
          activeOrders,
          todayOrders,
          weekCompletedOrders,
          maxCapacity: 8,
          availabilityStatus,
          canTakeNewOrder: activeOrders < 8
        },
        performance: {
          weeklyCompletions: weekCompletedOrders,
          efficiency: weekCompletedOrders > 0 ? 'high' : 'normal'
        }
      };
    })
  );

  // Sort by availability (available first, then by workload)
  pickupBoysWithWorkload.sort((a, b) => {
    if (a.workload.availabilityStatus === 'available' && b.workload.availabilityStatus !== 'available') return -1;
    if (b.workload.availabilityStatus === 'available' && a.workload.availabilityStatus !== 'available') return 1;
    return a.workload.activeOrders - b.workload.activeOrders;
  });

  res.status(200).json({
    success: true,
    count: pickupBoysWithWorkload.length,
    data: pickupBoysWithWorkload,
    summary: {
      available: pickupBoysWithWorkload.filter(pb => pb.workload.availabilityStatus === 'available').length,
      busy: pickupBoysWithWorkload.filter(pb => pb.workload.availabilityStatus === 'busy').length,
      overloaded: pickupBoysWithWorkload.filter(pb => pb.workload.availabilityStatus === 'overloaded').length,
      canTakeOrders: pickupBoysWithWorkload.filter(pb => pb.workload.canTakeNewOrder).length
    }
  });
});

// @desc    Get pickup boy performance metrics
// @route   GET /api/users/pickup-boys/:id/performance
// @access  Private/Admin/Manager
export const getPickupBoyPerformance = asyncHandler(async (req, res, next) => {
  const pickupBoy = await User.findOne({ 
    _id: req.params.id, 
    role: 'pickup_boy' 
  }).select('firstName lastName email phone');

  if (!pickupBoy) {
    return next(new ErrorResponse('Pickup boy not found', 404));
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const [
    totalAssigned,
    totalCompleted,
    monthlyCompleted,
    weeklyCompleted,
    averageRating,
    activeOrders
  ] = await Promise.all([
    Order.countDocuments({ assignedPickupBoy: req.params.id }),
    Order.countDocuments({ assignedPickupBoy: req.params.id, status: 'completed' }),
    Order.countDocuments({ 
      assignedPickupBoy: req.params.id, 
      status: 'completed',
      updatedAt: { $gte: startOfMonth }
    }),
    Order.countDocuments({ 
      assignedPickupBoy: req.params.id, 
      status: 'completed',
      updatedAt: { $gte: startOfWeek }
    }),
    Order.aggregate([
      { $match: { assignedPickupBoy: pickupBoy._id, status: 'completed' } },
      { $group: { _id: null, avgRating: { $avg: '$customerRating.rating' } } }
    ]),
    Order.countDocuments({
      assignedPickupBoy: req.params.id,
      status: { $in: ['assigned', 'in_transit', 'picked_up'] }
    })
  ]);

  const completionRate = totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      pickupBoy,
      performance: {
        totalAssigned,
        totalCompleted,
        completionRate: `${completionRate}%`,
        monthlyCompleted,
        weeklyCompleted,
        activeOrders,
        averageRating: averageRating[0]?.avgRating || 0,
        status: activeOrders > 5 ? 'busy' : 'available'
      }
    }
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
    await emailService.sendPasswordResetNotification(user, newPassword);
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

// @desc    Send assignment notification to pickup boy
// @route   POST /api/users/:id/notify-assignment
// @access  Private/Admin/Manager  
export const notifyPickupBoyAssignment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  const pickupBoy = await User.findOne({ 
    _id: req.params.id, 
    role: 'pickup_boy' 
  });

  if (!pickupBoy) {
    return next(new ErrorResponse('Pickup boy not found', 404));
  }

  const order = await Order.findById(orderId)
    .populate('customerId', 'firstName lastName phone')
    .populate('items.categoryId', 'name');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  try {
    await emailService.sendPickupBoyAssignmentNotification(pickupBoy, order);
    
    res.status(200).json({
      success: true,
      message: 'Assignment notification sent to pickup boy'
    });
  } catch (error) {
    console.error('Failed to send assignment notification:', error);
    return next(new ErrorResponse('Failed to send assignment notification', 500));
  }
});