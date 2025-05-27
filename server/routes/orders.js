import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router.route('/')
  .post((req, res) => {
    res.status(201).json({ success: true, message: 'Create order' });
  })
  .get((req, res) => {
    res.status(200).json({ success: true, message: 'Get user orders' });
  });

router.get('/:id', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Get order by ID',
    id: req.params.id
  });
});

router.put('/:id/cancel', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Cancel order',
    id: req.params.id
  });
});

// Admin/Manager routes
router.get('/all', authorize('admin', 'manager'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all orders' });
});

router.put('/:id/status', authorize('admin', 'manager', 'pickup_boy'), (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Update order status',
    id: req.params.id
  });
});

router.put('/:id/assign', authorize('admin', 'manager'), (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Assign pickup boy',
    id: req.params.id
  });
});

// Pickup Boy routes
router.get('/assigned', authorize('pickup_boy'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get assigned orders' });
});

router.put('/:id/verify', authorize('pickup_boy'), (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Verify pickup pin',
    id: req.params.id
  });
});

export default router;