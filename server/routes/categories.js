import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for viewing categories
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Get all categories' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Get category by ID',
    id: req.params.id
  });
});

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.route('/')
  .post(authorize('admin'), (req, res) => {
    res.status(201).json({ success: true, message: 'Create category' });
  });

router.route('/:id')
  .put(authorize('admin'), (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Update category',
      id: req.params.id
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Delete category',
      id: req.params.id
    });
  });

export default router;