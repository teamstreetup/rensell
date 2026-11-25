const crypto = require('crypto');

function hashUserId(userId) {
  if (!userId) {
    return null;
  }
  return crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 16);
}

function logRateLimitBlocked(event) {
  const payload = {
    event: 'rate_limit_blocked',
    route: event.route,
    scope: event.scope,
    clientIp: event.clientIp,
    userHash: hashUserId(event.userId),
    maxRequests: event.maxRequests,
    remaining: Math.max(event.remaining, 0),
    resetMs: Math.max(event.resetMs, 0),
    timestamp: new Date().toISOString(),
  };

  console.warn('[security]', JSON.stringify(payload));
}

module.exports = { logRateLimitBlocked };
