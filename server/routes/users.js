// server/routes/users.js
// UPDATED: Enhanced user routes with pickup boy availability and assignment features

import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats,
  getPickupBoys,
  getPickupBoyAvailability,
  getPickupBoyPerformance,
  resetUserPassword,
  notifyUser,
  notifyPickupBoyAssignment
} from '../controllers/users.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Admin/Manager routes
router.use(authorize('admin', 'manager'));

// FIXED: Special routes MUST come before parameterized routes
// Get user statistics
router.get('/stats', getUserStats);

// Get pickup boys for assignment (basic list)
router.get('/pickup-boys', getPickupBoys);

// Get pickup boys with availability info (enhanced)
router.get('/pickup-boys/availability', getPickupBoyAvailability);

// Main user routes
router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

// Parameterized routes - these come AFTER special routes
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

// User status management
router.put('/:id/status', updateUserStatus);

// Pickup boy specific routes
router.get('/:id/performance', getPickupBoyPerformance);

// Admin only routes
router.put('/:id/reset-password', authorize('admin'), resetUserPassword);
router.post('/:id/notify', notifyUser);
router.post('/:id/notify-assignment', notifyPickupBoyAssignment);

export default router;