import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay key ID or secret is not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }
      const qty = item.quantity || 1;
      if (product.stock < qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      total += product.price * qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
      product.stock -= qty;
      await product.save();
    }
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress: shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'razorpay',
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const amount = Math.round(order.total * 100);
    const razorpay = getRazorpayClient();
    const paymentOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: order._id.toString(),
      payment_capture: 1,
    });

    order.paymentInfo = {
      razorpayOrderId: paymentOrder.id,
    };
    await order.save();

    res.json({
      success: true,
      paymentOrder: {
        id: paymentOrder.id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create UPI Intent Payment
export const createUPIIntentPayment = async (req, res) => {
  try {
    const { vpa } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }
    const amount = Math.round(order.total * 100);
    const razorpay = getRazorpayClient();

    if (!order.paymentInfo?.razorpayOrderId) {
      const razorpayOrder = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: order._id.toString(),
        payment_capture: 1,
      });
      order.paymentInfo = {
        ...order.paymentInfo,
        razorpayOrderId: razorpayOrder.id,
      };
      await order.save();
    }

    // Create payment with UPI intent method
    const payment = await razorpay.paymentLink.create({
      amount,
      currency: 'INR',
      accept_partial: false,
      first_min_partial_amount: amount,
      description: `Payment for Order ${order._id}`,
      customer_notify: 1,
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        orderId: order._id.toString(),
      },
      callback_url: process.env.PAYMENT_CALLBACK_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${order._id}`,
      callback_method: 'get',
    });

    // Store payment info
    order.paymentInfo = {
      ...order.paymentInfo,
      razorpayPaymentId: payment.id,
      paymentMethod: 'upi',
      shortUrl: payment.short_url,
    };
    await order.save();

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        short_url: payment.short_url,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check UPI Payment Status
export const checkUPIPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const razorpay = getRazorpayClient();
    const paymentLinkId = order.paymentInfo?.razorpayPaymentId;

    if (!paymentLinkId) {
      return res.status(400).json({ success: false, message: 'No UPI payment in progress' });
    }

    const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);

    // If payment link is paid, update order
    if (paymentLink.status === 'paid' && paymentLink.payments?.count > 0) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.paymentInfo = {
        ...order.paymentInfo,
        razorpaySignature: paymentLink.id,
      };
      await order.save();
    } else if (paymentLink.status === 'cancelled' || paymentLink.status === 'expired') {
      order.paymentStatus = 'failed';
      await order.save();
    }

    res.json({
      success: true,
      paymentStatus: paymentLink.status,
      isPaid: order.isPaid,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid';
    order.paymentInfo = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    order.status = 'processing';
    await order.save();

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
