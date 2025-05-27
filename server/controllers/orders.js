// server/controllers/orders.js
// Enhanced orders controller with email notifications and receipt generation

import Order from '../models/Order.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { emailService } from '../services/emailService.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, pickupDetails, pricing } = req.body;

  try {
    // Validate items and calculate pricing
    let estimatedTotal = 0;
    const processedItems = [];
    
    for (let item of items) {
      const category = await Category.findById(item.categoryId);
      if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${item.categoryId}`, 404));
      }
      
      // Calculate estimated price based on category and condition
      let basePrice = category.basePrice;
      
      // Apply subcategory modifier if specified
      if (item.subcategory) {
        const subcategory = category.subcategories.find(sub => sub.name === item.subcategory);
        if (subcategory) {
          basePrice *= subcategory.priceModifier;
        }
      }
      
      // Apply condition modifier
      const conditionMultiplier = category.conditionMultipliers[item.condition] || 0.5;
      const itemEstimatedPrice = Math.round(basePrice * conditionMultiplier * item.quantity);
      
      // Prepare item for database
      const processedItem = {
        categoryId: item.categoryId,
        subcategory: item.subcategory || '',
        brand: item.brand || '',
        model: item.model || '',
        condition: item.condition,
        quantity: item.quantity,
        estimatedPrice: itemEstimatedPrice,
        description: item.description || ''
      };
      
      processedItems.push(processedItem);
      estimatedTotal += itemEstimatedPrice;
    }

    // Create order object
    const orderData = {
      customerId: req.user.id,
      items: processedItems,
      pickupDetails: {
        address: {
          street: pickupDetails.address.street,
          city: pickupDetails.address.city,
          state: pickupDetails.address.state,
          pincode: pickupDetails.address.pincode,
          landmark: pickupDetails.address.landmark || ''
        },
        preferredDate: new Date(pickupDetails.preferredDate),
        timeSlot: pickupDetails.timeSlot,
        contactNumber: pickupDetails.contactNumber,
        specialInstructions: pickupDetails.specialInstructions || ''
      },
      pricing: {
        estimatedTotal,
        pickupCharges: pricing?.pickupCharges || 0,
        finalAmount: estimatedTotal + (pricing?.pickupCharges || 0)
      }
    };

    // Create the order
    const order = await Order.create(orderData);

    // Populate the created order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.categoryId', 'name icon')
      .populate('customerId', 'firstName lastName email phone');

    // Send confirmation email
    try {
      await emailService.sendOrderConfirmation(populatedOrder, populatedOrder.customerId);
      console.log('Order confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return next(new ErrorResponse('Failed to create order', 500));
  }
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
    timestamp: new Date(),
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
  const { status, page = 1, limit = 10, search } = req.query;
  
  let query = Order.find()
    .populate('items.categoryId', 'name icon')
    .populate('assignedPickupBoy', 'firstName lastName phone')
    .populate('customerId', 'firstName lastName email phone');

  if (status && status !== 'all') {
    query = query.where({ status });
  }

  // Search functionality
  if (search) {
    query = query.where({
      $or: [
        { orderNumber: new RegExp(search, 'i') },
        { 'customerId.firstName': new RegExp(search, 'i') },
        { 'customerId.lastName': new RegExp(search, 'i') },
        { 'customerId.email': new RegExp(search, 'i') }
      ]
    });
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
    pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
  }
  if (startIndex > 0) {
    pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination,
    data: orders
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Manager/PickupBoy
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note, actualTotal } = req.body;
  
  let order = await Order.findById(req.params.id)
    .populate('customerId', 'firstName lastName email')
    .populate('assignedPickupBoy', 'firstName lastName phone');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // If pickup boy, can only update orders assigned to them
  if (req.user.role === 'pickup_boy' && 
      (!order.assignedPickupBoy || order.assignedPickupBoy._id.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this order', 401));
  }

  const oldStatus = order.status;
  order.status = status;

  // Update actual total if provided (for completed orders)
  if (actualTotal && status === 'completed') {
    order.pricing.actualTotal = actualTotal;
    order.pricing.finalAmount = actualTotal + order.pricing.pickupCharges;
  }

  order.timeline.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user.id,
    note: note || `Status updated to ${status}`
  });

  await order.save();

  // Send email notifications for status changes
  try {
    if (status === 'completed' && oldStatus !== 'completed') {
      await emailService.sendOrderCompleted(order, order.customerId);
    }
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }

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
  
  let order = await Order.findById(req.params.id)
    .populate('customerId', 'firstName lastName email');

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
    timestamp: new Date(),
    updatedBy: req.user.id,
    note: `Assigned to ${pickupBoy.firstName} ${pickupBoy.lastName}`
  });

  await order.save();

  // Populate for email
  const populatedOrder = await Order.findById(order._id)
    .populate('customerId', 'firstName lastName email')
    .populate('assignedPickupBoy', 'firstName lastName phone');

  // Send email notification
  try {
    await emailService.sendPickupAssigned(populatedOrder, populatedOrder.customerId, populatedOrder.assignedPickupBoy);
  } catch (emailError) {
    console.error('Failed to send pickup assignment email:', emailError);
  }

  res.status(200).json({
    success: true,
    data: populatedOrder
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
  order.pinVerification.verifiedAt = new Date();
  order.status = 'picked_up';
  order.timeline.push({
    status: 'picked_up',
    timestamp: new Date(),
    updatedBy: req.user.id,
    note: 'PIN verified and items picked up'
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Generate order receipt PDF
// @route   GET /api/orders/:id/receipt
// @access  Private
export const generateOrderReceipt = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.categoryId', 'name')
    .populate('customerId', 'firstName lastName email phone address')
    .populate('assignedPickupBoy', 'firstName lastName phone');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check permissions
  if (order.customerId._id.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access this receipt', 401));
  }

  // Only generate receipt for completed orders
  if (order.status !== 'completed') {
    return next(new ErrorResponse('Receipt can only be generated for completed orders', 400));
  }

  try {
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.orderNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Company header
    doc.fontSize(20).fillColor('#22c55e').text('E-Waste Management Platform', 50, 50);
    doc.fontSize(12).fillColor('black').text('Sustainable E-Waste Recycling', 50, 75);
    doc.text('Phone: +91-98765-43210 | Email: contact@ewaste.org', 50, 90);
    
    // Draw line
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    // Receipt title
    doc.fontSize(16).fillColor('#1f2937').text('PICKUP RECEIPT', 50, 130);
    
    // Order details section
    let yPosition = 160;
    doc.fontSize(12).fillColor('black');
    
    const leftColumn = 50;
    const rightColumn = 300;
    
    doc.text('Order Number:', leftColumn, yPosition).text(order.orderNumber, rightColumn, yPosition);
    yPosition += 20;
    doc.text('Order Date:', leftColumn, yPosition).text(new Date(order.createdAt).toLocaleDateString(), rightColumn, yPosition);
    yPosition += 20;
    doc.text('Completion Date:', leftColumn, yPosition).text(new Date(order.updatedAt).toLocaleDateString(), rightColumn, yPosition);
    yPosition += 20;
    doc.text('Status:', leftColumn, yPosition).text(order.status.toUpperCase(), rightColumn, yPosition);
    
    yPosition += 40;
    
    // Customer details
    doc.fontSize(14).fillColor('#1f2937').text('Customer Details:', leftColumn, yPosition);
    yPosition += 25;
    doc.fontSize(12).fillColor('black');
    
    const customer = order.customerId;
    doc.text('Name:', leftColumn, yPosition).text(`${customer.firstName} ${customer.lastName}`, rightColumn, yPosition);
    yPosition += 20;
    doc.text('Email:', leftColumn, yPosition).text(customer.email, rightColumn, yPosition);
    yPosition += 20;
    doc.text('Phone:', leftColumn, yPosition).text(customer.phone || 'N/A', rightColumn, yPosition);
    
    yPosition += 40;
    
    // Pickup details
    doc.fontSize(14).fillColor('#1f2937').text('Pickup Details:', leftColumn, yPosition);
    yPosition += 25;
    doc.fontSize(12).fillColor('black');
    
    const address = order.pickupDetails.address;
    doc.text('Address:', leftColumn, yPosition);
    doc.text(`${address.street}, ${address.city}`, rightColumn, yPosition);
    yPosition += 15;
    doc.text(`${address.state} - ${address.pincode}`, rightColumn, yPosition);
    yPosition += 25;
    
    if (order.assignedPickupBoy) {
      doc.text('Pickup Executive:', leftColumn, yPosition)
         .text(`${order.assignedPickupBoy.firstName} ${order.assignedPickupBoy.lastName}`, rightColumn, yPosition);
      yPosition += 20;
    }
    
    yPosition += 30;
    
    // Items table
    doc.fontSize(14).fillColor('#1f2937').text('Items Collected:', leftColumn, yPosition);
    yPosition += 30;
    
    // Table headers
    doc.fontSize(10).fillColor('#6b7280');
    doc.text('Item', leftColumn, yPosition);
    doc.text('Condition', leftColumn + 150, yPosition);
    doc.text('Qty', leftColumn + 220, yPosition);
    doc.text('Amount', leftColumn + 280, yPosition);
    yPosition += 20;
    
    // Draw line under headers
    doc.moveTo(leftColumn, yPosition - 5).lineTo(leftColumn + 330, yPosition - 5).stroke();
    
    // Table rows
    doc.fontSize(10).fillColor('black');
    order.items.forEach((item) => {
      const itemName = `${item.brand ? item.brand + ' ' : ''}${item.model ? item.model + ' ' : ''}(${item.categoryId.name})`;
      doc.text(itemName.substring(0, 25), leftColumn, yPosition);
      doc.text(item.condition, leftColumn + 150, yPosition);
      doc.text(item.quantity.toString(), leftColumn + 220, yPosition);
      doc.text(`₹${(item.finalPrice || item.estimatedPrice).toLocaleString()}`, leftColumn + 280, yPosition);
      yPosition += 18;
    });
    
    // Draw line before totals
    yPosition += 10;
    doc.moveTo(leftColumn, yPosition).lineTo(leftColumn + 330, yPosition).stroke();
    yPosition += 20;
    
    // Totals
    doc.fontSize(12);
    doc.text('Estimated Total:', leftColumn + 180, yPosition).text(`₹${order.pricing.estimatedTotal.toLocaleString()}`, leftColumn + 280, yPosition);
    yPosition += 20;
    
    if (order.pricing.pickupCharges > 0) {
      doc.text('Pickup Charges:', leftColumn + 180, yPosition).text(`₹${order.pricing.pickupCharges.toLocaleString()}`, leftColumn + 280, yPosition);
      yPosition += 20;
    }
    
    doc.fontSize(14).fillColor('#22c55e');
    doc.text('Final Amount:', leftColumn + 180, yPosition)
       .text(`₹${(order.pricing.actualTotal || order.pricing.finalAmount).toLocaleString()}`, leftColumn + 280, yPosition);
    
    yPosition += 50;
    
    // Footer
    doc.fontSize(10).fillColor('#6b7280');
    doc.text('Thank you for contributing to environmental sustainability!', leftColumn, yPosition);
    yPosition += 15;
    doc.text('This is a computer-generated receipt and does not require a signature.', leftColumn, yPosition);
    
    // Environmental impact note
    yPosition += 30;
    doc.fontSize(12).fillColor('#22c55e');
    doc.text('🌱 Environmental Impact:', leftColumn, yPosition);
    yPosition += 20;
    doc.fontSize(10).fillColor('black');
    
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedCO2Saved = Math.round(totalItems * 0.4);
    const estimatedEnergySaved = Math.round(totalItems * 1.4);
    
    doc.text(`• Items recycled: ${totalItems}`, leftColumn, yPosition);
    yPosition += 15;
    doc.text(`• Estimated CO₂ emissions prevented: ${estimatedCO2Saved} kg`, leftColumn, yPosition);
    yPosition += 15;
    doc.text(`• Estimated energy saved: ${estimatedEnergySaved} kWh`, leftColumn, yPosition);
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return next(new ErrorResponse('Failed to generate receipt', 500));
  }
});