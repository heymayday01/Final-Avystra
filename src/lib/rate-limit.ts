/**
 * Simple in-memory rate limiter for API routes.
 *
 * Uses a sliding-window counter per IP. Not distributed (won't work across
 * multiple server instances) but sufficient for a single-process Next.js
 * deployment. For multi-instance, swap for Redis-backed rate limiting.
 *
 * Usage:
 *   const { success, retryAfter } = rateLimit(request, { limit: 5, windowMs: 3600_000 });
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically purge expired entries to prevent memory bloat.
// Runs every 10 minutes.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

interface RateLimitOptions {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  /** Seconds until the client can retry (for the Retry-After header). */
  retryAfter: number;
  /** Remaining requests in the current window. */
  remaining: number;
}

/** Extract the client IP from a Next.js Request, accounting for proxies. */
function getClientIp(request: Request): string {
  // Check common proxy headers (Caddy, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; the first entry is the client
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Check whether a request should be rate-limited.
 * Call this at the top of an API route handler.
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions
): RateLimitResult {
  const ip = getClientIp(request);
  const now = Date.now();
  const key = `${ip}:${options.windowMs}`;

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    // First request in window (or window expired) — start fresh
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, retryAfter: 0, remaining: options.limit - 1 };
  }

  entry.count += 1;
  if (entry.count > options.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfter, remaining: 0 };
  }

  return {
    success: true,
    retryAfter: 0,
    remaining: Math.max(0, options.limit - entry.count),
  };
}
