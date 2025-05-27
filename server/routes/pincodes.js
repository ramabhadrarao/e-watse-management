// server/routes/pincodes.js
import express from 'express';
import {
  checkPincode,
  getPincodes,
  createPincode,
  updatePincode,
  deletePincode,
  assignPickupBoy,
  removePickupBoy
} from '../controllers/pincodes.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/check/:pincode', checkPincode);

// Protect all routes after this middleware
router.use(protect);

// Admin/Manager routes
router.route('/')
  .get(authorize('admin', 'manager'), getPincodes)
  .post(authorize('admin'), createPincode);

router.route('/:id')
  .put(authorize('admin'), updatePincode)
  .delete(authorize('admin'), deletePincode);

router.put('/:id/assign', authorize('admin', 'manager'), assignPickupBoy);
router.delete('/:id/assign/:pickupBoyId', authorize('admin', 'manager'), removePickupBoy);

export default router;