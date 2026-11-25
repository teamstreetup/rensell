const { Redis } = require('@upstash/redis');

const buckets = new Map();
let redisClient;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function cleanupExpiredEntries(now) {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(existing.resetAt - now, 0),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetMs: Math.max(existing.resetAt - now, 0),
  };
}

async function checkRateLimitDistributed(key, maxRequests, windowMs) {
  const redis = getRedisClient();
  if (!redis) {
    return checkRateLimit(key, maxRequests, windowMs);
  }

  const redisKey = `ratelimit:${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  try {
    const currentCount = await redis.incr(redisKey);
    if (currentCount === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);
    const resetMs = Math.max((ttl > 0 ? ttl : windowSeconds) * 1000, 0);

    if (currentCount > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(maxRequests - currentCount, 0),
      resetMs,
    };
  } catch (error) {
    console.error('Distributed rate limiter unavailable; falling back to memory limiter.', error);
    return checkRateLimit(key, maxRequests, windowMs);
  }
}

function buildRateLimitHeaders(result, limit) {
  const resetSeconds = Math.ceil(result.resetMs / 1000);

  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(result.remaining, 0)),
    'X-RateLimit-Reset': String(resetSeconds),
    'Retry-After': String(resetSeconds),
  };
}

module.exports = {
  checkRateLimit,
  checkRateLimitDistributed,
  buildRateLimitHeaders,
};
