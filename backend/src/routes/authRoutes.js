import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
// import { refreshTokenController } from '../controllers/refreshTokenController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .isMobilePhone('any')
      .withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'admin']),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Valid phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// router.post("/refresh-token", refreshTokenController); // Add this line to handle refresh token requests

// router.post('/logout', logout); // Add this line to handle logout requests

router.get('/me', protect, getMe);

export default router;
