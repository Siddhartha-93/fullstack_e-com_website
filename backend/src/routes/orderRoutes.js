import express from 'express';
import {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  paymentSuccess,
  createUPIIntentPayment,
  checkUPIPaymentStatus,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', protect, requireRole('customer'), createOrder);
router.post('/:id/payment', protect, createPaymentOrder);
router.post('/:id/payment/verify', protect, verifyPayment);
router.post('/:id/payment/upi', protect, createUPIIntentPayment);
router.get('/:id/payment/upi/status', protect, checkUPIPaymentStatus);
router.get('/:id/payment/success', protect, paymentSuccess);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, requireRole('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, requireRole('admin'), updateOrderStatus);

export default router;
