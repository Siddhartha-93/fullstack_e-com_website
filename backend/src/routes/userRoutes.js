import express from 'express';
import { getAllUsers, getUserById, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', protect, requireRole('admin'), getAllUsers);
router.get('/:id', protect, requireRole('admin'), getUserById);
router.put('/profile', protect, updateProfile);

export default router;
