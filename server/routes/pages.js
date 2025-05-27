import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for viewing pages
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Get all published pages' });
});

router.get('/:slug', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Get page by slug',
    slug: req.params.slug
  });
});

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.route('/')
  .post(authorize('admin'), (req, res) => {
    res.status(201).json({ success: true, message: 'Create page' });
  });

router.route('/:id')
  .put(authorize('admin'), (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Update page',
      id: req.params.id
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Delete page',
      id: req.params.id
    });
  });

export default router;