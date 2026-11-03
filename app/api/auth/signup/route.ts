import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signupSchema } from '@/lib/validations';
import { signToken } from '@/lib/jwt';
import { buildRateLimitHeaders, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const emailKey = typeof body?.email === 'string' ? body.email.toLowerCase() : 'unknown';

    const ipLimit = checkRateLimit(`signup:ip:${clientIp}`, 10, 60 * 60 * 1000);
    const identityLimit = checkRateLimit(`signup:identity:${emailKey}:${clientIp}`, 5, 60 * 60 * 1000);

    if (!ipLimit.allowed || !identityLimit.allowed) {
      const blockedResult = !ipLimit.allowed ? ipLimit : identityLimit;
      const blockedLimit = !ipLimit.allowed ? 10 : 5;

      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(blockedResult, blockedLimit),
        }
      );
    }

    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
