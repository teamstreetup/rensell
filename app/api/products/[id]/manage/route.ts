import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/jwt';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload?.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        await connectDB();

        const product = await Product.findById(params.id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const isOwner = String(product.ownerId) === payload.userId;
        const isAdmin = payload.role === 'admin';
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Get managed product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}