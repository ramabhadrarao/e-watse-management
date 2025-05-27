// server/controllers/support.js
// FIXED: Support ticket management controller with proper route handling

import SupportTicket from '../models/SupportTicket.js';
import { asyncHandler } from '../middleware/async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { emailService } from '../services/emailService.js';
import mongoose from 'mongoose';

// @desc    Create new support ticket
// @route   POST /api/support
// @access  Private
export const createSupportTicket = asyncHandler(async (req, res, next) => {
  const { subject, description, category, orderId, priority } = req.body;

  const ticketData = {
    customerId: req.user.id,
    subject,
    description,
    category,
    priority: priority || 'medium'
  };

  if (orderId) {
    ticketData.orderId = orderId;
  }

  const ticket = await SupportTicket.create(ticketData);

  // Populate customer data for email
  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate('customerId', 'firstName lastName email');

  // Send email notification
  try {
    await emailService.sendSupportTicketCreated(populatedTicket, populatedTicket.customerId);
  } catch (emailError) {
    console.error('Failed to send support ticket email:', emailError);
  }

  res.status(201).json({
    success: true,
    data: populatedTicket
  });
});

// @desc    Get user's support tickets
// @route   GET /api/support
// @access  Private
export const getUserSupportTickets = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = SupportTicket.find({ customerId: req.user.id });

  if (status) {
    query = query.where({ status });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const total = await SupportTicket.countDocuments({ customerId: req.user.id });

  const tickets = await query
    .populate('orderId', 'orderNumber')
    .populate('assignedTo', 'firstName lastName')
    .sort({ lastActivityAt: -1 })
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
    count: tickets.length,
    total,
    pagination,
    data: tickets
  });
});

// @desc    Get single support ticket
// @route   GET /api/support/:id
// @access  Private
export const getSupportTicket = asyncHandler(async (req, res, next) => {
  // FIXED: Check if id is valid ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid ticket ID format`, 400));
  }

  let query = SupportTicket.findById(req.params.id)
    .populate('customerId', 'firstName lastName email phone')
    .populate('orderId', 'orderNumber')
    .populate('assignedTo', 'firstName lastName email')
    .populate('messages.senderId', 'firstName lastName role');

  // If not admin/manager, only allow users to see their own tickets
  if (!['admin', 'manager'].includes(req.user.role)) {
    query = query.where({ customerId: req.user.id });
  }

  const ticket = await query;

  if (!ticket) {
    return next(new ErrorResponse(`Support ticket not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Add message to support ticket
// @route   POST /api/support/:id/messages
// @access  Private
export const addTicketMessage = asyncHandler(async (req, res, next) => {
  const { message, isInternal = false } = req.body;

  // FIXED: Check if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid ticket ID format`, 400));
  }

  let ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Support ticket not found with id of ${req.params.id}`, 404));
  }

  // Check permissions
  if (!['admin', 'manager'].includes(req.user.role) && ticket.customerId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this ticket', 401));
  }

  // Only staff can add internal messages
  if (isInternal && !['admin', 'manager'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to add internal messages', 401));
  }

  const newMessage = {
    senderId: req.user.id,
    message,
    isInternal,
    timestamp: new Date()
  };

  ticket.messages.push(newMessage);
  
  // Update status if customer replied
  if (ticket.customerId.toString() === req.user.id && ticket.status === 'waiting_customer') {
    ticket.status = 'open';
  }

  await ticket.save();

  // Populate the updated ticket
  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate('customerId', 'firstName lastName email')
    .populate('messages.senderId', 'firstName lastName role');

  res.status(200).json({
    success: true,
    data: populatedTicket
  });
});

// @desc    Update support ticket status
// @route   PUT /api/support/:id/status
// @access  Private/Admin/Manager
export const updateTicketStatus = asyncHandler(async (req, res, next) => {
  const { status, resolutionNote } = req.body;

  // FIXED: Check if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid ticket ID format`, 400));
  }

  let ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Support ticket not found with id of ${req.params.id}`, 404));
  }

  ticket.status = status;

  // If resolving ticket
  if (status === 'resolved' || status === 'closed') {
    ticket.resolution = {
      resolvedBy: req.user.id,
      resolutionNote: resolutionNote || 'Ticket resolved',
      resolvedAt: new Date()
    };
  }

  await ticket.save();

  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate('customerId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .populate('resolution.resolvedBy', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: populatedTicket
  });
});

// @desc    Assign support ticket
// @route   PUT /api/support/:id/assign
// @access  Private/Admin/Manager
export const assignSupportTicket = asyncHandler(async (req, res, next) => {
  const { assignedTo } = req.body;

  // FIXED: Check if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid ticket ID format`, 400));
  }

  let ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Support ticket not found with id of ${req.params.id}`, 404));
  }

  ticket.assignedTo = assignedTo;
  ticket.status = 'in_progress';

  await ticket.save();

  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate('customerId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: populatedTicket
  });
});

// @desc    Get all support tickets (Admin/Manager)
// @route   GET /api/support/all
// @access  Private/Admin/Manager
export const getAllSupportTickets = asyncHandler(async (req, res, next) => {
  const { status, priority, category, page = 1, limit = 10 } = req.query;

  let query = SupportTicket.find();

  if (status && status !== 'all') {
    query = query.where({ status });
  }
  if (priority && priority !== 'all') {
    query = query.where({ priority });
  }
  if (category && category !== 'all') {
    query = query.where({ category });
  }

  // Only show tickets assigned to user if they're not admin
  if (req.user.role === 'manager') {
    query = query.where({ assignedTo: req.user.id });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const total = await SupportTicket.countDocuments(query.getQuery());

  const tickets = await query
    .populate('customerId', 'firstName lastName email phone')
    .populate('orderId', 'orderNumber')
    .populate('assignedTo', 'firstName lastName')
    .sort({ lastActivityAt: -1 })
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
    count: tickets.length,
    total,
    pagination,
    data: tickets
  });
});

// @desc    Get support ticket statistics
// @route   GET /api/support/stats
// @access  Private/Admin/Manager
export const getSupportStats = asyncHandler(async (req, res, next) => {
  const stats = await Promise.all([
    SupportTicket.countDocuments({ status: 'open' }),
    SupportTicket.countDocuments({ status: 'in_progress' }),
    SupportTicket.countDocuments({ status: 'resolved' }),
    SupportTicket.countDocuments({ status: 'closed' }),
    SupportTicket.countDocuments({ priority: 'urgent' }),
    SupportTicket.countDocuments({ priority: 'high' }),
    SupportTicket.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    })
  ]);

  const [open, inProgress, resolved, closed, urgent, high, thisWeek] = stats;

  res.status(200).json({
    success: true,
    data: {
      total: open + inProgress + resolved + closed,
      open,
      inProgress,
      resolved,
      closed,
      urgent,
      high,
      thisWeek
    }
  });
});

// @desc    Rate support ticket
// @route   PUT /api/support/:id/rate
// @access  Private
export const rateSupportTicket = asyncHandler(async (req, res, next) => {
  const { rating, feedback } = req.body;

  // FIXED: Check if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid ticket ID format`, 400));
  }

  let ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Support ticket not found with id of ${req.params.id}`, 404));
  }

  // Check if user owns the ticket
  if (ticket.customerId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to rate this ticket', 401));
  }

  // Can only rate resolved or closed tickets
  if (!['resolved', 'closed'].includes(ticket.status)) {
    return next(new ErrorResponse('Can only rate resolved tickets', 400));
  }

  ticket.customerRating = {
    rating,
    feedback: feedback || '',
    ratedAt: new Date()
  };

  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket
  });
});