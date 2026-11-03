import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { buildRateLimitHeaders, checkRateLimitDistributed } from '@/lib/rateLimit';
import { logRateLimitBlocked } from '@/lib/securityLog';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = await checkRateLimitDistributed(`payment:create-order:ip:${clientIp}`, 25, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      logRateLimitBlocked({
        route: '/api/payment/create-order',
        scope: 'ip',
        clientIp,
        maxRequests: 25,
        remaining: ipLimit.remaining,
        resetMs: ipLimit.resetMs,
      });

      return NextResponse.json(
        { error: 'Too many create-order attempts. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(ipLimit, 25),
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

    const identityLimit = await checkRateLimitDistributed(`payment:create-order:user:${decoded.userId}:${clientIp}`, 8, 10 * 60 * 1000);
    if (!identityLimit.allowed) {
      logRateLimitBlocked({
        route: '/api/payment/create-order',
        scope: 'user',
        clientIp,
        userId: decoded.userId,
        maxRequests: 8,
        remaining: identityLimit.remaining,
        resetMs: identityLimit.resetMs,
      });

      return NextResponse.json(
        { error: 'Too many create-order attempts for this account. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(identityLimit, 8),
        }
      );
    }

    const body = await req.json();
    const internalOrderId = body.orderId || body.receipt;

    if (!internalOrderId || !mongoose.Types.ObjectId.isValid(internalOrderId)) {
      return NextResponse.json(
        { error: 'Valid orderId is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !keyId) {
      return NextResponse.json({
        error: 'Razorpay configuration missing',
        details: 'RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID must be configured.',
      }, { status: 500 });
    }

    await connectDB();

    const orderDoc = await Order.findOne({
      _id: internalOrderId,
      userId: decoded.userId,
    });

    if (!orderDoc) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (orderDoc.paymentMethod !== 'razorpay') {
      return NextResponse.json({ error: 'Order is not eligible for online payment' }, { status: 400 });
    }

    if (orderDoc.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    const amountValue = Number(orderDoc.totalAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const order = await createRazorpayOrder(amountValue, internalOrderId);

    orderDoc.razorpayOrderId = order.id;
    await orderDoc.save();

    return NextResponse.json({
      success: true,
      internalOrderId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    const details =
      error?.error?.description ||
      error?.message ||
      (typeof error === 'string' ? error : 'Payment provider error');
    return NextResponse.json(
      { error: 'Failed to create Razorpay order', details },
      { status: 500 }
    );
  }
}
