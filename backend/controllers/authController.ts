
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../schemas';
import { AuthRequest } from '../middleware/authMiddleware';

// Mock OTP Storage (In production, use Redis)
const otpStore: Record<string, string> = {};

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    // Generate Mock OTP
    const otp = '123456'; 
    otpStore[phone] = otp;

    // In production, integrate with Twilio/SNS here
    console.log(`[OTP SERVICE] Sent ${otp} to ${phone}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, name, role } = req.body; // Name/Role provided if registering

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP required' });
    }

    if (otpStore[phone] !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP
    delete otpStore[phone];

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Registration Logic
      if (!name) {
        return res.status(404).json({ message: 'User not found. Please provide name to register.' });
      }

      user = await User.create({
        name,
        phone,
        role: role || 'CUSTOMER',
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      pendingDues: user.pendingDues,
      token: generateToken(user.id),
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const { _id, name, phone, email, role, pendingDues } = req.user;
  res.status(200).json({
    id: _id,
    name,
    phone,
    email,
    role,
    pendingDues,
  });
};
