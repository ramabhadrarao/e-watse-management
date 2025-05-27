// server/routes/orders.js
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  assignPickupBoy,
  getAssignedOrders,
  verifyPickupPin
} from '../controllers/orders.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router.route('/')
  .post(createOrder)
  .get(getUserOrders);

router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin/Manager routes
router.get('/all', authorize('admin', 'manager'), getAllOrders);
router.put('/:id/status', authorize('admin', 'manager', 'pickup_boy'), updateOrderStatus);
router.put('/:id/assign', authorize('admin', 'manager'), assignPickupBoy);

// Pickup Boy routes
router.get('/assigned', authorize('pickup_boy'), getAssignedOrders);
router.put('/:id/verify', authorize('pickup_boy'), verifyPickupPin);

export default router;