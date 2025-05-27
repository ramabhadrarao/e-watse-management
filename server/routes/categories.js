// server/routes/categories.js
import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.route('/')
  .post(authorize('admin'), createCategory);

router.route('/:id')
  .put(authorize('admin'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

export default router;
