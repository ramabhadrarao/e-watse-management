import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Only admin can access these routes
router.use(authorize('admin', 'manager'));

// Route handlers will be implemented here
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Users route' });
});

export default router;