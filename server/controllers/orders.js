import Order from '../models/Order.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/async.js';
import { ErrorResponse } from '../utils/errorResponse.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, pickupDetails, pricing } = req.body;

  // Validate items and calculate pricing
  let estimatedTotal = 0;
  
  for (let item of items) {
    const category = await Category.findById(item.categoryId);
    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${item.categoryId}`, 404));
    }
    
    // Calculate estimated price based on category and condition
    let basePrice = category.basePrice;
    if (item.subcategory) {
      const subcategory = category.subcategories.find(sub => sub.name === item.subcategory);
      if (subcategory) {
        basePrice *= subcategory.priceModifier;
      }
    }
    
    const conditionMultiplier = category.conditionMultipliers[item.condition] || 0.5;
    item.estimatedPrice = Math.round(basePrice * conditionMultiplier * item.quantity);
    estimatedTotal += item.estimatedPrice;
  }

  const order = await Order.create({
    customerId: req.user.id,
    items,
    pickupDetails,
    pricing: {
      estimatedTotal,
      ...pricing
    }
  });

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ customerId: req.user.id })
    .populate('items.categoryId', 'name icon')
    .populate('assignedPickupBoy', 'firstName lastName phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
  let query = Order.findById(req.params.id)
    .populate('items.categoryId', 'name icon')
    .populate('assignedPickupBoy', 'firstName lastName phone')
    .populate('customerId', 'firstName lastName email phone');

  // If not admin/manager, only allow users to see their own orders
  if (req.user.role === 'customer') {
    query = query.where({ customerId: req.user.id });
  }

  const order = await query;

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user owns the order or is admin
  if (order.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Check if order can be cancelled
  if (['picked_up', 'processing', 'completed'].includes(order.status)) {
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));
  }

  order.status = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    timestamp: Date.now(),
    updatedBy: req.user.id,
    note: req.body.reason || 'Order cancelled by customer'
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders (Admin/Manager)
// @route   GET /api/orders/all
// @access  Private/Admin/Manager
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let query = Order.find()
    .populate('items.categoryId', 'name icon')
    .populate('assignedPickupBoy', 'firstName lastName phone')
    .populate('customerId', 'firstName lastName email phone');

  if (status) {
    query = query.where({ status });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Order.countDocuments(query.getQuery());

  query = query.skip(startIndex).limit(limit).sort({ createdAt: -1 });

  const orders = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    data: orders
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Manager/PickupBoy
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;
  
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // If pickup boy, can only update orders assigned to them
  if (req.user.role === 'pickup_boy' && 
      (!order.assignedPickupBoy || order.assignedPickupBoy.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this order', 401));
  }

  order.status = status;
  order.timeline.push({
    status,
    timestamp: Date.now(),
    updatedBy: req.user.id,
    note: note || `Status updated to ${status}`
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Assign pickup boy to order
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin/Manager
export const assignPickupBoy = asyncHandler(async (req, res, next) => {
  const { pickupBoyId } = req.body;
  
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Verify pickup boy exists
  const pickupBoy = await User.findOne({ _id: pickupBoyId, role: 'pickup_boy' });
  if (!pickupBoy) {
    return next(new ErrorResponse('Pickup boy not found', 404));
  }

  order.assignedPickupBoy = pickupBoyId;
  order.status = 'assigned';
  order.timeline.push({
    status: 'assigned',
    timestamp: Date.now(),
    updatedBy: req.user.id,
    note: `Assigned to ${pickupBoy.firstName} ${pickupBoy.lastName}`
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get assigned orders (Pickup Boy)
// @route   GET /api/orders/assigned
// @access  Private/PickupBoy
export const getAssignedOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ 
    assignedPickupBoy: req.user.id,
    status: { $in: ['assigned', 'in_transit', 'picked_up'] }
  })
    .populate('items.categoryId', 'name icon')
    .populate('customerId', 'firstName lastName email phone address')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Verify pickup PIN
// @route   PUT /api/orders/:id/verify
// @access  Private/PickupBoy
export const verifyPickupPin = asyncHandler(async (req, res, next) => {
  const { pin } = req.body;
  
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if pickup boy is assigned to this order
  if (!order.assignedPickupBoy || order.assignedPickupBoy.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to verify this order', 401));
  }

  // Verify PIN
  if (order.pinVerification.pin !== pin) {
    return next(new ErrorResponse('Invalid PIN', 400));
  }

  order.pinVerification.isVerified = true;
  order.pinVerification.verifiedAt = Date.now();
  order.status = 'picked_up';
  order.timeline.push({
    status: 'picked_up',
    timestamp: Date.now(),
    updatedBy: req.user.id,
    note: 'PIN verified and items picked up'
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});