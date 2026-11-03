import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { signToken } from '@/lib/jwt';
import { buildRateLimitHeaders, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const emailKey = typeof body?.email === 'string' ? body.email.toLowerCase() : 'unknown';

    const ipLimit = checkRateLimit(`login:ip:${clientIp}`, 20, 15 * 60 * 1000);
    const identityLimit = checkRateLimit(`login:identity:${emailKey}:${clientIp}`, 8, 15 * 60 * 1000);

    if (!ipLimit.allowed || !identityLimit.allowed) {
      const blockedResult = !ipLimit.allowed ? ipLimit : identityLimit;
      const blockedLimit = !ipLimit.allowed ? 20 : 8;

      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(blockedResult, blockedLimit),
        }
      );
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Your account has been suspended/blocked. Please contact support.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
