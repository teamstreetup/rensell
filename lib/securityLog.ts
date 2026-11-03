import crypto from 'crypto';

type RateLimitBlockLog = {
    route: string;
    scope: 'ip' | 'user';
    clientIp: string;
    userId?: string;
    maxRequests: number;
    remaining: number;
    resetMs: number;
};

function hashUserId(userId?: string): string | null {
    if (!userId) {
        return null;
    }

    return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 16);
}

export function logRateLimitBlocked(event: RateLimitBlockLog) {
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