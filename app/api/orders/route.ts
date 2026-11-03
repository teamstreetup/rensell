import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/jwt';
import { orderSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.errors[0].message,
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    await connectDB();

    const productIds = validation.data.items.map((item) => item.productId);
    const invalidProductId = productIds.find((id) => !mongoose.Types.ObjectId.isValid(id));

    if (invalidProductId) {
      return NextResponse.json(
        { error: 'Invalid product ID in order items' },
        { status: 400 }
      );
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name image price type')
      .lean();

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products were not found' },
        { status: 400 }
      );
    }

    const productsById = new Map(products.map((product) => [String(product._id), product]));

    let computedTotal = 0;
    const normalizedItems = validation.data.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new Error('Product lookup failed during order normalization');
      }

      const unitPrice = Number(product.price);
      const quantity = Number(item.quantity);
      let lineTotal = unitPrice * quantity;

      if (product.type === 'rent') {
        const rentalDays = Number(item.rentalDays || 1);
        const securityDeposit = Number(item.securityDeposit || 0);
        lineTotal = ((unitPrice * rentalDays) + securityDeposit) * quantity;
      }

      computedTotal += lineTotal;

      return {
        productId: product._id,
        quantity,
        price: unitPrice,
        name: product.name,
        image: product.image,
        type: product.type,
        ...(product.type === 'rent' && {
          startDate: item.startDate,
          endDate: item.endDate,
          rentalDays: Number(item.rentalDays || 1),
          securityDeposit: Number(item.securityDeposit || 0),
        }),
      };
    });

    const roundedComputedTotal = Math.round(computedTotal * 100) / 100;
    if (Math.abs(roundedComputedTotal - validation.data.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Order total mismatch. Please refresh cart and try again.' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      userId: payload.userId,
      items: normalizedItems,
      shippingAddress: validation.data.shippingAddress,
      paymentMethod: validation.data.paymentMethod,
      totalAmount: roundedComputedTotal,
    });

    return NextResponse.json(
      { message: 'Order placed successfully', order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await Order.findOne({ _id: orderId, userId: payload.userId })
        .populate('items.productId');

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ orders: [order] });
    }

    const orders = await Order.find({ userId: payload.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
