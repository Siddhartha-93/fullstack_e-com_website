import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);

router.post('/', protect, requireRole('admin'), upload.single('image'), createCategory);
router.put('/:id', protect, requireRole('admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

export default router;
