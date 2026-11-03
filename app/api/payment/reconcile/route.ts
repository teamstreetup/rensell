import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { fetchPaymentDetails } from '@/lib/razorpay';
import { buildRateLimitHeaders, checkRateLimitDistributed } from '@/lib/rateLimit';
import { logRateLimitBlocked } from '@/lib/securityLog';

export async function POST(req: NextRequest) {
    try {
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const ipLimit = await checkRateLimitDistributed(`payment:reconcile:ip:${clientIp}`, 20, 15 * 60 * 1000);
        if (!ipLimit.allowed) {
            logRateLimitBlocked({
                route: '/api/payment/reconcile',
                scope: 'ip',
                clientIp,
                maxRequests: 20,
                remaining: ipLimit.remaining,
                resetMs: ipLimit.resetMs,
            });

            return NextResponse.json(
                { error: 'Too many payment reconciliation attempts. Please try again later.' },
                {
                    status: 429,
                    headers: buildRateLimitHeaders(ipLimit, 20),
                }
            );
        }

        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload?.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const identityLimit = await checkRateLimitDistributed(`payment:reconcile:user:${payload.userId}:${clientIp}`, 6, 15 * 60 * 1000);
        if (!identityLimit.allowed) {
            logRateLimitBlocked({
                route: '/api/payment/reconcile',
                scope: 'user',
                clientIp,
                userId: payload.userId,
                maxRequests: 6,
                remaining: identityLimit.remaining,
                resetMs: identityLimit.resetMs,
            });

            return NextResponse.json(
                { error: 'Too many payment reconciliation attempts for this account. Please try again later.' },
                {
                    status: 429,
                    headers: buildRateLimitHeaders(identityLimit, 6),
                }
            );
        }

        const body = await req.json();
        const { orderId, razorpayPaymentId } = body;

        if (!orderId || !razorpayPaymentId) {
            return NextResponse.json(
                { error: 'orderId and razorpayPaymentId are required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        await connectDB();

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const isOwner = String(order.userId) === payload.userId;
        const isAdmin = payload.role === 'admin';
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const payment = await fetchPaymentDetails(razorpayPaymentId);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            return NextResponse.json({ error: 'Payment is not captured/authorized' }, { status: 400 });
        }

        const expectedAmountInPaise = Math.round(Number(order.totalAmount) * 100);
        if (Number(payment.amount) !== expectedAmountInPaise) {
            return NextResponse.json({ error: 'Paid amount mismatch' }, { status: 400 });
        }

        if (order.razorpayOrderId && payment.order_id !== order.razorpayOrderId) {
            return NextResponse.json({ error: 'Payment/order mismatch' }, { status: 400 });
        }

        order.razorpayOrderId = payment.order_id;
        order.razorpayPaymentId = payment.id;
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order reconciled successfully',
            order,
        });
    } catch (error: any) {
        console.error('Payment reconcile error:', error);
        return NextResponse.json(
            { error: 'Failed to reconcile payment', details: error?.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
