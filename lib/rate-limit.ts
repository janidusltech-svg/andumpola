// lib/rate-limit.ts
// Fixed-window rate limiter.
// - Works immediately using in-memory counters (good for single-instance / low scale).
// - Automatically upgrades to distributed limiting across all serverless
//   instances IF you set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//   (free account at upstash.com). No code change needed.

type Result = { success: boolean; remaining: number };

// ---- in-memory fallback (per-instance) ----
const buckets = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, limit: number, windowSec: number): Result {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowSec * 1000 });
    return { success: true, remaining: limit - 1 };
  }
  b.count += 1;
  if (b.count > limit) return { success: false, remaining: 0 };
  return { success: true, remaining: limit - b.count };
}

// occasional cleanup so the map doesn't grow forever
function sweep() {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}

// ---- Upstash (distributed) via REST, no package needed ----
async function upstashLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<Result | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const incRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers,
      cache: "no-store",
    });
    const inc = await incRes.json();
    const count = Number(inc.result);
    if (count === 1) {
      await fetch(
        `${url}/expire/${encodeURIComponent(key)}/${windowSec}`,
        { headers, cache: "no-store" }
      );
    }
    if (count > limit) return { success: false, remaining: 0 };
    return { success: true, remaining: limit - count };
  } catch {
    return null; // on any error, don't block the user
  }
}

/**
 * @param id    unique bucket id (e.g. `orders:${ip}`)
 * @param limit max requests per window
 * @param windowSec window length in seconds
 */
export async function rateLimit(
  id: string,
  limit: number,
  windowSec: number
): Promise<Result> {
  if (Math.random() < 0.01) sweep();
  const distributed = await upstashLimit(id, limit, windowSec);
  if (distributed) return distributed;
  return memoryLimit(id, limit, windowSec);
}

// Extract a client IP from the request headers (Vercel sets these)
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
