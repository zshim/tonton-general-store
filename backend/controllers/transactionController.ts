import { Request, Response } from 'express';
import { Transaction, User } from '../schemas';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Record a payment (pay off dues)
// @route   POST /api/transactions/pay
// @access  Private (Manager can pay for anyone, Customer can pay for self)
export const recordPayment = async (req: any, res: Response) => {
  try {
    const { userId, amount, description, paymentMethod } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Determine target user
    // If Manager, they can specify userId to record a payment for a customer.
    // If Customer, they are paying for themselves.
    let targetUserId = req.user._id;
    if (req.user.role === 'MANAGER' && userId) {
      targetUserId = userId;
    }

    // 1. Create Transaction (Credit)
    const transaction = await Transaction.create({
      user: targetUserId,
      amount: amount,
      type: 'CREDIT', // Payment reduces debt
      description: description || 'Dues Payment',
      // Store method if available
      ...(paymentMethod && { description: `${description || 'Dues Payment'} (${paymentMethod})` }), 
      date: new Date()
    });

    // 2. Update User Pending Dues
    const user = await User.findById(targetUserId);
    if (user) {
      // Subtracting payment from dues. 
      // If result is negative, it implies the user has store credit.
      user.pendingDues -= amount; 
      await user.save();
    } else {
        return res.status(404).json({message: 'User not found'});
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user transactions
// @route   GET /api/transactions/my
// @access  Private
export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions for a specific user (Manager view)
// @route   GET /api/transactions/user/:id
// @access  Private/Manager
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.params.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users with pending dues
// @route   GET /api/transactions/dues
// @access  Private/Manager
export const getPendingDuesUsers = async (req: Request, res: Response) => {
  try {
    // Find users where pendingDues is greater than 0
    const users = await User.find({ pendingDues: { $gt: 0 } })
        .select('name email phone pendingDues')
        .sort({ pendingDues: -1 }); // Highest debt first
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};