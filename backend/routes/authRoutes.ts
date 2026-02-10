
import express from 'express';
import { sendOtp, verifyOtp, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected Routes
router.get('/me', protect, getMe);

export default router;
