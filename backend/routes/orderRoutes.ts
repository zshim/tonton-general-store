import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
} from '../controllers/orderController';
import { protect, managerOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems) // Customer creates order OR Manager creates bill
  .get(protect, managerOnly, getOrders); // Manager views all

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

export default router;