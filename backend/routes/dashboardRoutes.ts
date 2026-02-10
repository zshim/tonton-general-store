import express from 'express';
import { getManagerStats, getCustomerStats } from '../controllers/dashboardController';
import { protect, managerOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Manager Dashboard Stats
router.get('/manager', protect, managerOnly, getManagerStats);

// Customer Dashboard Stats
router.get('/customer', protect, getCustomerStats);

export default router;