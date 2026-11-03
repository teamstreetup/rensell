import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

// Razorpay sends webhook events as POST requests
// Configure this URL in Razorpay Dashboard → Settings → Webhooks
// URL: https://your-domain.com/api/payment/webhook

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`Razorpay webhook received: ${eventType}`);

    await connectDB();

    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const paymentAmount = Number(payment.amount);

        // Find order by razorpayOrderId and update
        const order = await Order.findOne({ razorpayOrderId });

        if (order) {
          const expectedAmount = Math.round(Number(order.totalAmount) * 100);
          if (paymentAmount !== expectedAmount) {
            console.error(`Webhook amount mismatch for order ${order._id}: expected ${expectedAmount}, got ${paymentAmount}`);
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
          }

          // Only update if not already paid (idempotent)
          if (order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.razorpayPaymentId = razorpayPaymentId;
            await order.save();
            console.log(`Webhook: Order ${order._id} marked as paid`);
          } else {
            console.log(`Webhook: Order ${order._id} already paid, skipping`);
          }
        } else {
          // Order might not have razorpayOrderId set yet
          // Try finding by receipt (which is the order._id)
          const receiptOrder = await Order.findById(payment.notes?.orderId);
          if (receiptOrder && receiptOrder.paymentStatus !== 'paid') {
            const expectedAmount = Math.round(Number(receiptOrder.totalAmount) * 100);
            if (paymentAmount !== expectedAmount) {
              console.error(`Webhook amount mismatch for receipt order ${receiptOrder._id}: expected ${expectedAmount}, got ${paymentAmount}`);
              return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
            }

            receiptOrder.paymentStatus = 'paid';
            receiptOrder.status = 'confirmed';
            receiptOrder.razorpayOrderId = razorpayOrderId;
            receiptOrder.razorpayPaymentId = razorpayPaymentId;
            await receiptOrder.save();
            console.log(`Webhook: Order ${receiptOrder._id} marked as paid via receipt`);
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.status = 'cancelled';
          await order.save();
          console.log(`Webhook: Order ${order._id} marked as failed`);
        }
        break;
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity;
        const paymentId = refund.payment_id;

        const order = await Order.findOne({ razorpayPaymentId: paymentId });
        if (order) {
          order.paymentStatus = 'refunded';
          await order.save();
          console.log(`Webhook: Order ${order._id} marked as refunded`);
        }
        break;
      }

      default:
        console.log(`Webhook: Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Return 500 on processing failures so Razorpay retries transient errors.
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
