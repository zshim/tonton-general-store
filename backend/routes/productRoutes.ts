import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/productController';
import { protect, managerOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.get('/low-stock', protect, managerOnly, getLowStockProducts); // Specific route must come before :id
router.get('/:id', getProductById);

// Protected Manager Routes
router.post('/', protect, managerOnly, createProduct);
router.put('/:id', protect, managerOnly, updateProduct);
router.delete('/:id', protect, managerOnly, deleteProduct);

export default router;