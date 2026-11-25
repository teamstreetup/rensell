const {
  checkRateLimit,
  checkRateLimitDistributed,
  buildRateLimitHeaders,
} = require('../utils/rateLimit');
const { logRateLimitBlocked } = require('../utils/securityLog');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function createRateLimiter({ prefix, ipMax, identityMax, windowMs, distributed = false, identityResolver }) {
  return async (req, res, next) => {
    try {
      const clientIp = getClientIp(req);
      const checkFn = distributed ? checkRateLimitDistributed : checkRateLimit;

      const ipResult = await checkFn(`${prefix}:ip:${clientIp}`, ipMax, windowMs);
      if (!ipResult.allowed) {
        logRateLimitBlocked({
          route: req.originalUrl,
          scope: 'ip',
          clientIp,
          maxRequests: ipMax,
          remaining: ipResult.remaining,
          resetMs: ipResult.resetMs,
        });
        const headers = buildRateLimitHeaders(ipResult, ipMax);
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }

      if (identityMax && typeof identityResolver === 'function') {
        const identity = identityResolver(req);
        if (identity) {
          const idResult = await checkFn(`${prefix}:identity:${identity}:${clientIp}`, identityMax, windowMs);
          if (!idResult.allowed) {
            logRateLimitBlocked({
              route: req.originalUrl,
              scope: 'user',
              clientIp,
              userId: req.user?.userId,
              maxRequests: identityMax,
              remaining: idResult.remaining,
              resetMs: idResult.resetMs,
            });
            const headers = buildRateLimitHeaders(idResult, identityMax);
            Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
            return res.status(429).json({ error: 'Too many attempts for this account. Please try again later.' });
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { createRateLimiter, getClientIp };
