import { type NextRequest } from 'next/server';

/**
 * Creates a rate limiter for a specific API route.
 * Falls back to a local Map. Note: In serverless, this only
 * limits requests hitting the same exact instance.
 *
 * @param maxRequests — max hits within the window before limiting
 * @param windowSec  — window size in seconds (default 60)
 */
export function createRateLimiter(
    maxRequests: number,
    windowSec = 60
) {
    const map = new Map<string, { count: number; resetTime: number }>();
    return async function isRateLimited(identifier: string): Promise<boolean> {
        const now = Date.now();
        const entry = map.get(identifier);

        if (!entry || now > entry.resetTime) {
            map.set(identifier, { count: 1, resetTime: now + windowSec * 1000 });
            return false;
        }

        entry.count++;
        return entry.count > maxRequests;
    };
}

/**
 * Rate limiter for middleware. Returns { limited, remaining, reset }.
 * In-memory fallback.
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowSec = 60
): Promise<{ limited: boolean }> {
    const now = Date.now();
    const entry = middlewareMap.get(key);
    if (!entry || now > entry.resetAt) {
        middlewareMap.set(key, { count: 1, resetAt: now + windowSec * 1000 });
        return { limited: false };
    }
    entry.count++;
    return { limited: entry.count > limit };
}

// In-memory store for middleware fallback
const MIDDLEWARE_MAP_MAX = 10_000;
const middlewareMap = new Map<string, { count: number; resetAt: number }>();

// Lazy cleanup to prevent unbounded growth
function cleanupMiddlewareMap() {
    if (middlewareMap.size > MIDDLEWARE_MAP_MAX) {
        const now = Date.now();
        for (const [k, entry] of middlewareMap) {
            if (now > entry.resetAt) middlewareMap.delete(k);
        }
    }
}

// Run cleanup periodically (safe in both Edge and Node)
if (typeof globalThis !== 'undefined') {
    setInterval(cleanupMiddlewareMap, 30_000);
}

/**
 * Extracts the client IP from a request in a Vercel-safe way.
 * Falls back to 'unknown' if no forwarding headers are present.
 */
export function getRequestIP(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
