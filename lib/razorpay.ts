import Razorpay from 'razorpay';
import crypto from 'crypto';

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

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error('Please define the RAZORPAY_KEY_SECRET environment variable');
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, receipt: string) {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await getRazorpayInstance().orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
}

// Fetch payment details
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const payment = await getRazorpayInstance().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Fetch payment error:', error);
    throw error;
  }
}

// Refund payment
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refund = await getRazorpayInstance().payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Partial or full refund
    });
    return refund;
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
}
