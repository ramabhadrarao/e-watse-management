// server/routes/support.js
// FIXED: Support ticket routes with proper special route handling

import express from 'express';
import {
  createSupportTicket,
  getUserSupportTickets,
  getSupportTicket,
  addTicketMessage,
  updateTicketStatus,
  assignSupportTicket,
  getAllSupportTickets,
  getSupportStats,
  rateSupportTicket
} from '../controllers/support.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// FIXED: Special routes MUST come before parameterized routes
// Admin/Manager routes - these must be defined FIRST
router.get('/all', authorize('admin', 'manager'), getAllSupportTickets);
router.get('/stats', authorize('admin', 'manager'), getSupportStats);

// Customer routes
router.route('/')
  .post(createSupportTicket)
  .get(getUserSupportTickets);

// Parameterized routes - these must come AFTER special routes
router.get('/:id', getSupportTicket);

// Add message to ticket
router.post('/:id/messages', addTicketMessage);

// Rate ticket (customer only)
router.put('/:id/rate', rateSupportTicket);

// Admin/Manager only operations
router.put('/:id/status', authorize('admin', 'manager'), updateTicketStatus);
router.put('/:id/assign', authorize('admin', 'manager'), assignSupportTicket);

export default router;