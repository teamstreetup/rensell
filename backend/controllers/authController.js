const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.validatedBody;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role || 'user',
    });

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isVerified: Boolean(user.isVerified),
        profileImage: user.profileImage || '',
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: 'Your account has been suspended/blocked. Please contact support.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role || 'user',
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isVerified: Boolean(user.isVerified),
        profileImage: user.profileImage || '',
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
