const express = require('express');
const {
  createRazorpayOrderHandler,
  verifyPaymentHandler,
  webhookHandler,
  reconcilePaymentHandler,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

const createOrderIpLimiter = createRateLimiter({
  prefix: 'payment:create-order',
  ipMax: 25,
  windowMs: 10 * 60 * 1000,
  distributed: true,
});

const createOrderUserLimiter = createRateLimiter({
  prefix: 'payment:create-order-user',
  ipMax: 25,
  identityMax: 8,
  windowMs: 10 * 60 * 1000,
  distributed: true,
  identityResolver: (req) => req.user?.userId,
});

const verifyIpLimiter = createRateLimiter({
  prefix: 'payment:verify',
  ipMax: 40,
  windowMs: 10 * 60 * 1000,
  distributed: true,
});

const verifyUserLimiter = createRateLimiter({
  prefix: 'payment:verify-user',
  ipMax: 40,
  identityMax: 12,
  windowMs: 10 * 60 * 1000,
  distributed: true,
  identityResolver: (req) => req.user?.userId,
});

const reconcileIpLimiter = createRateLimiter({
  prefix: 'payment:reconcile',
  ipMax: 20,
  windowMs: 15 * 60 * 1000,
  distributed: true,
});

const reconcileUserLimiter = createRateLimiter({
  prefix: 'payment:reconcile-user',
  ipMax: 20,
  identityMax: 6,
  windowMs: 15 * 60 * 1000,
  distributed: true,
  identityResolver: (req) => req.user?.userId,
});

router.post(
  '/create-order',
  createOrderIpLimiter,
  authMiddleware,
  createOrderUserLimiter,
  createRazorpayOrderHandler
);
router.post(
  '/verify',
  verifyIpLimiter,
  authMiddleware,
  verifyUserLimiter,
  verifyPaymentHandler
);
router.post('/webhook', webhookHandler);
router.post(
  '/reconcile',
  reconcileIpLimiter,
  authMiddleware,
  reconcileUserLimiter,
  reconcilePaymentHandler
);

module.exports = router;
