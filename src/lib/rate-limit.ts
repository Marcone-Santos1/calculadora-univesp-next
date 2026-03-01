/**
 * In-memory rate limiter.
 *
 * Works per serverless instance (adequate for blocking single-origin bots).
 * For cross-instance global limits, swap the Map for Upstash Redis.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Auto-cleanup expired entries every 60 seconds to prevent memory leaks.
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (now >= entry.resetTime) {
                store.delete(key);
            }
        }
    }, 60_000);
}

/**
 * Check and increment rate limit for the given key.
 *
 * @param key      Unique identifier (IP, userId, questionId, etc.)
 * @param limit    Max allowed requests in the window
 * @param windowMs Time window in milliseconds (default: 60 000 = 1 min)
 */
export function rateLimit(
    key: string,
    limit: number,
    windowMs = 60_000,
): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetTime) {
        // First request in this window
        store.set(key, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: limit - 1, resetIn: windowMs };
    }

    if (entry.count >= limit) {
        return { success: false, remaining: 0, resetIn: entry.resetTime - now };
    }

    entry.count += 1;
    return {
        success: true,
        remaining: limit - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Falls back to a literal 'unknown' string (still rate-limited as a group).
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        headers.get('x-real-ip') ??
        'unknown'
    );
}
