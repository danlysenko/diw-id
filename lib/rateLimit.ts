// In-memory fixed-window rate limiter. The app runs as a single pm2 process in front of
// one SQLite file, so a per-process map is accurate — no Redis needed for this scale.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let callsSinceSweep = 0;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/** Allows up to `limit` calls per `windowMs` for a given key (e.g. "route:ip"). */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Cheap amortised cleanup so the map doesn't grow unbounded across many distinct IPs.
  callsSinceSweep += 1;
  if (callsSinceSweep >= 200) {
    callsSinceSweep = 0;
    sweep(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true };
}

/** Best-effort client IP from the headers nginx is configured to set (see deploy/setup-vps.sh). */
export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
