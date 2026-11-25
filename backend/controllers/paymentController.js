const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchPaymentDetails,
} = require('../utils/razorpay');

async function createRazorpayOrderHandler(req, res) {
  try {
    const internalOrderId = req.body.orderId || req.body.receipt;

    if (!internalOrderId || !mongoose.Types.ObjectId.isValid(internalOrderId)) {
      return res.status(400).json({ error: 'Valid orderId is required' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: 'Razorpay configuration missing',
        details: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.',
      });
    }

    const orderDoc = await Order.findOne({
      _id: internalOrderId,
      userId: req.user.userId,
    });

    if (!orderDoc) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderDoc.paymentMethod !== 'razorpay') {
      return res.status(400).json({ error: 'Order is not eligible for online payment' });
    }

    if (orderDoc.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    // Always use verified database totalAmount (never trust frontend amount)
    const amountValue = Number(orderDoc.totalAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    const razorpayOrder = await createRazorpayOrder(amountValue, internalOrderId);

    orderDoc.razorpayOrderId = razorpayOrder.id;
    // Allow retries on previously failed orders
    if (orderDoc.paymentStatus === 'failed') {
      orderDoc.paymentStatus = 'pending';
      orderDoc.status = 'pending';
    }
    await orderDoc.save();

    return res.json({
      success: true,
      internalOrderId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    const details =
      error?.error?.description ||
      error?.message ||
      (typeof error === 'string' ? error : 'Payment provider error');
    return res.status(500).json({
      error: 'Failed to create Razorpay order',
      details,
    });
  }
}

async function verifyPaymentHandler(req, res) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const orderDoc = await Order.findOne({ _id: orderId, userId: req.user.userId });
    if (!orderDoc) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderDoc.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Order already verified', order: orderDoc });
    }

    if (!orderDoc.razorpayOrderId) {
      return res.status(400).json({ error: 'Razorpay order not initialized for this order' });
    }

    if (orderDoc.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ error: 'Payment does not belong to this order' });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const payment = await fetchPaymentDetails(razorpayPaymentId);
    if (payment.order_id !== razorpayOrderId) {
      return res.status(400).json({ error: 'Payment order mismatch' });
    }

    const expectedAmountInPaise = Math.round(Number(orderDoc.totalAmount) * 100);
    if (Number(payment.amount) !== expectedAmountInPaise) {
      return res.status(400).json({ error: 'Paid amount mismatch' });
    }

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({ error: 'Payment is not in a valid state' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'paid',
        status: 'confirmed',
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      error: 'Payment verification failed',
      details: error?.error?.description || error?.message || 'Unknown error',
    });
  }
}

async function webhookHandler(req, res) {
  try {
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`Razorpay webhook received: ${eventType}`);

    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const paymentAmount = Number(payment.amount);

        const order = await Order.findOne({ razorpayOrderId });
        if (order) {
          const expectedAmount = Math.round(Number(order.totalAmount) * 100);
          if (paymentAmount !== expectedAmount) {
            return res.status(400).json({ error: 'Amount mismatch' });
          }

          if (order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.razorpayPaymentId = razorpayPaymentId;
            await order.save();
          }
        } else if (payment.notes?.orderId && mongoose.Types.ObjectId.isValid(payment.notes.orderId)) {
          const receiptOrder = await Order.findById(payment.notes.orderId);
          if (receiptOrder && receiptOrder.paymentStatus !== 'paid') {
            const expectedAmount = Math.round(Number(receiptOrder.totalAmount) * 100);
            if (paymentAmount !== expectedAmount) {
              return res.status(400).json({ error: 'Amount mismatch' });
            }
            receiptOrder.paymentStatus = 'paid';
            receiptOrder.status = 'confirmed';
            receiptOrder.razorpayOrderId = razorpayOrderId;
            receiptOrder.razorpayPaymentId = razorpayPaymentId;
            await receiptOrder.save();
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.status = 'cancelled';
          await order.save();
        }
        break;
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity;
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
        if (order) {
          order.paymentStatus = 'refunded';
          await order.save();
        }
        break;
      }

      default:
        console.log(`Webhook: Unhandled event type: ${eventType}`);
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

async function reconcilePaymentHandler(req, res) {
  try {
    const { orderId, razorpayPaymentId } = req.body;

    if (!orderId || !razorpayPaymentId) {
      return res.status(400).json({ error: 'orderId and razorpayPaymentId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isOwner = String(order.userId) === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payment = await fetchPaymentDetails(razorpayPaymentId);

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({ error: 'Payment is not captured/authorized' });
    }

    const expectedAmountInPaise = Math.round(Number(order.totalAmount) * 100);
    if (Number(payment.amount) !== expectedAmountInPaise) {
      return res.status(400).json({ error: 'Paid amount mismatch' });
    }

    if (order.razorpayOrderId && payment.order_id !== order.razorpayOrderId) {
      return res.status(400).json({ error: 'Payment/order mismatch' });
    }

    order.razorpayOrderId = payment.order_id;
    order.razorpayPaymentId = payment.id;
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    return res.json({
      success: true,
      message: 'Order reconciled successfully',
      order,
    });
  } catch (error) {
    console.error('Payment reconcile error:', error);
    return res.status(500).json({
      error: 'Failed to reconcile payment',
      details: error?.error?.description || error?.message || 'Unknown error',
    });
  }
}

module.exports = {
  createRazorpayOrderHandler,
  verifyPaymentHandler,
  webhookHandler,
  reconcilePaymentHandler,
};
