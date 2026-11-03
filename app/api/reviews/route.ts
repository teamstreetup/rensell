import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 });
    }

    await connectDB();

    // Dynamically import User to ensure schema is registered for population
    await import('@/models/User');

    const reviews = await Review.find({ productId })
      .populate('userId', 'name profileImage') // Fetch the reviewer's basic identity
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Product ID and a valid rating (1-5) are required' }, { status: 400 });
    }

    await connectDB();

    // Upsert review (create if not exists, update if exists to overwrite old rating)
    const review = await Review.findOneAndUpdate(
      { productId, userId: payload.userId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    // Dynamic aggregation: Recalculate average rating for this specific product
    const aggregationResult = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const newAvgRating = aggregationResult.length > 0 
      ? Math.round(aggregationResult[0].avgRating * 10) / 10 // round to 1 decimal place
      : 5;

    // Apply the exact aggregated rating score directly to the product architecture
    await Product.findByIdAndUpdate(productId, { rating: newAvgRating });

    return NextResponse.json(
      { message: 'Review published actively!', review, newAvgRating },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Post review error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'You have already reviewed this item.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
