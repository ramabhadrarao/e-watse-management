// server/routes/users.js - Enhanced
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
  resetUserPassword,
  notifyUser
} from '../controllers/users.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Admin/Manager routes
router.use(authorize('admin', 'manager'));

// Get user statistics
router.get('/stats', getUserStats);

// Get pickup boys for assignment
router.get('/pickup-boys', getPickupBoys);

// Main user routes
router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

// User status management
router.put('/:id/status', updateUserStatus);

// Admin only routes
router.put('/:id/reset-password', authorize('admin'), resetUserPassword);
router.post('/:id/notify', notifyUser);

export default router;
