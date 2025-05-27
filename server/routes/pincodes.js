import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for checking pincode serviceability
router.get('/check/:pincode', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Pincode check route',
    pincode: req.params.pincode
  });
});

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({ success: true, message: 'Get all pincodes' });
  })
  .post(authorize('admin'), (req, res) => {
    res.status(201).json({ success: true, message: 'Create pincode' });
  });

export default router;