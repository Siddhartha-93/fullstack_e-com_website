import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getTopSellingProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  requireRole('admin', 'vendor'),
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').isMongoId().withMessage('Valid category is required'),
  ],
  validate,
  
  createProduct
);

router.put('/:id', protect, requireRole('admin', 'vendor'), upload.single('image'), updateProduct);
router.delete('/:id', protect, requireRole('admin', 'vendor'), deleteProduct);

export default router;
