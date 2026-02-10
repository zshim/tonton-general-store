import express from 'express';
import {
  recordPayment,
  getMyTransactions,
  getUserTransactions,
  getPendingDuesUsers
} from '../controllers/transactionController';
import { protect, managerOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Record a payment (Manager or Customer)
router.post('/pay', protect, recordPayment);

// Get my transaction history (Customer)
router.get('/my', protect, getMyTransactions);

// Manager Only Routes
// Get list of all users with pending dues
router.get('/dues', protect, managerOnly, getPendingDuesUsers);
// Get transaction history of a specific user
router.get('/user/:id', protect, managerOnly, getUserTransactions);

export default router;