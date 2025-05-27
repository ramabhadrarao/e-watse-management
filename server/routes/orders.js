// server/routes/orders.js 
// UPDATED: Enhanced orders routes with assignment functionality

import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  getOrdersPendingAssignment,
  getOrderStatistics,
  updateOrderStatus,
  assignPickupBoy,
  bulkAssignOrders,
  autoAssignOrders,
  getAssignedOrders,
  verifyPickupPin,
  generateOrderReceipt
} from '../controllers/orders.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// FIXED: Special routes MUST come before parameterized routes
// Admin/Manager routes - these must be defined FIRST
router.get('/all', authorize('admin', 'manager'), getAllOrders);
router.get('/pending-assignment', authorize('admin', 'manager'), getOrdersPendingAssignment);
router.get('/statistics', authorize('admin', 'manager'), getOrderStatistics);

// Assignment routes
router.post('/bulk-assign', authorize('admin', 'manager'), bulkAssignOrders);
router.post('/auto-assign', authorize('admin', 'manager'), autoAssignOrders);

// Pickup Boy routes
router.get('/assigned', authorize('pickup_boy'), getAssignedOrders);

// Customer routes
router.route('/')
  .post(createOrder)
  .get(getUserOrders);

// Parameterized routes - these must come AFTER special routes
router.get('/:id', getOrder);

// Generate receipt
router.get('/:id/receipt', generateOrderReceipt);

// Cancel order
router.put('/:id/cancel', cancelOrder);

// Admin/Manager/PickupBoy operations
router.put('/:id/status', authorize('admin', 'manager', 'pickup_boy'), updateOrderStatus);
router.put('/:id/assign', authorize('admin', 'manager'), assignPickupBoy);

// Pickup Boy operations
router.put('/:id/verify', authorize('pickup_boy'), verifyPickupPin);

export default router;