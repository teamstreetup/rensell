const Razorpay = require('razorpay');
const crypto = require('crypto');

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Please define the RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables');
  }

  return { key_id: keyId, key_secret: keySecret };
}

function getRazorpayInstance() {
  return new Razorpay(getRazorpayConfig());
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  try {
    const text = `${orderId}|${paymentId}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error('Please define the RAZORPAY_KEY_SECRET environment variable');
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function createRazorpayOrder(amount, receipt) {
  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: String(receipt),
    payment_capture: 1,
  };

  return getRazorpayInstance().orders.create(options);
}

async function fetchPaymentDetails(paymentId) {
  return getRazorpayInstance().payments.fetch(paymentId);
}

async function refundPayment(paymentId, amount) {
  return getRazorpayInstance().payments.refund(paymentId, {
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}

module.exports = {
  verifyRazorpaySignature,
  createRazorpayOrder,
  fetchPaymentDetails,
  refundPayment,
};
