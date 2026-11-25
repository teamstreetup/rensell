const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check current user record to enforce live blocked-account & role checks
    const user = await User.findById(payload.userId).select('_id email role isBlocked name isVerified').lean();
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: 'Your account has been suspended/blocked. Please contact support.',
      });
    }

    req.user = {
      userId: String(user._id),
      email: user.email,
      role: user.role || 'user',
      name: user.name,
      isVerified: Boolean(user.isVerified),
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
