// server/routes/support.js
// Support ticket routes

import express from 'express';
import {
  createSupportTicket,
  getUserSupportTickets,
  getSupportTicket,
  addTicketMessage,
  updateTicketStatus,
  assignSupportTicket,
  getAllSupportTickets,
  rateSupportTicket
} from '../controllers/support.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router.route('/')
  .post(createSupportTicket)
  .get(getUserSupportTickets);

// Get single ticket
router.get('/:id', getSupportTicket);

// Add message to ticket
router.post('/:id/messages', addTicketMessage);

// Rate ticket (customer only)
router.put('/:id/rate', rateSupportTicket);

// Admin/Manager routes
router.get('/all', authorize('admin', 'manager'), getAllSupportTickets);
router.put('/:id/status', authorize('admin', 'manager'), updateTicketStatus);
router.put('/:id/assign', authorize('admin', 'manager'), assignSupportTicket);

export default router;


