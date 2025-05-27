import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  updateAddress
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/updateaddress', protect, updateAddress);

export default router;