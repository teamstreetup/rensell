import { NextRequest, NextResponse } from 'next/server';
import { fetchPaymentDetails, verifyRazorpaySignature } from '@/lib/razorpay';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { buildRateLimitHeaders, checkRateLimitDistributed } from '@/lib/rateLimit';
import { logRateLimitBlocked } from '@/lib/securityLog';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = await checkRateLimitDistributed(`payment:verify:ip:${clientIp}`, 40, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      logRateLimitBlocked({
        route: '/api/payment/verify',
        scope: 'ip',
        clientIp,
        maxRequests: 40,
        remaining: ipLimit.remaining,
        resetMs: ipLimit.resetMs,
      });

      return NextResponse.json(
        { error: 'Too many payment verification attempts. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(ipLimit, 40),
        }
      );
    }

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const identityLimit = await checkRateLimitDistributed(`payment:verify:user:${decoded.userId}:${clientIp}`, 12, 10 * 60 * 1000);
    if (!identityLimit.allowed) {
      logRateLimitBlocked({
        route: '/api/payment/verify',
        scope: 'user',
        clientIp,
        userId: decoded.userId,
        maxRequests: 12,
        remaining: identityLimit.remaining,
        resetMs: identityLimit.resetMs,
      });

      return NextResponse.json(
        { error: 'Too many payment verification attempts for this account. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(identityLimit, 12),
        }
      );
    }

    await connectDB();

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const orderDoc = await Order.findOne({ _id: orderId, userId: decoded.userId });
    if (!orderDoc) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (orderDoc.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, message: 'Order already verified', order: orderDoc });
    }

    if (!orderDoc.razorpayOrderId) {
      return NextResponse.json({ error: 'Razorpay order not initialized for this order' }, { status: 400 });
    }

    if (orderDoc.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: 'Payment does not belong to this order' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const payment = await fetchPaymentDetails(razorpayPaymentId);
    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json({ error: 'Payment order mismatch' }, { status: 400 });
    }

    const expectedAmountInPaise = Math.round(Number(orderDoc.totalAmount) * 100);
    if (payment.amount !== expectedAmountInPaise) {
      return NextResponse.json({ error: 'Paid amount mismatch' }, { status: 400 });
    }

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return NextResponse.json({ error: 'Payment is not in a valid state' }, { status: 400 });
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}
