import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/jwt';

// PATCH /api/orders/[id] — Update order status (e.g., mark payment as failed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { paymentStatus, status } = body;

    // User-level endpoint: allow only payment failure/cancellation retries.
    const allowedPaymentStatuses = ['failed'];
    const allowedStatuses = ['cancelled'];

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    // Only allow the order owner to update their order
    const order = await Order.findOne({ _id: params.id, userId: payload.userId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!paymentStatus && !status) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    if (order.paymentStatus !== 'pending' || order.status === 'delivered') {
      return NextResponse.json({ error: 'Order can no longer be modified' }, { status: 400 });
    }

    // Apply updates
    const updateFields: any = {};
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (status) updateFields.status = status;

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/orders/[id] — Get a specific order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findOne({ _id: params.id, userId: payload.userId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}
