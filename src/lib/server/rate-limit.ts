import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { auditLogger } from "./logger";

// Create a new ratelimiter, that allows 20 requests per 10 seconds
export const globalRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
});

// Stricter rate limit for authentication or sensitive actions (5 requests per minute)
export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export async function checkRateLimit(
  key: string,
  limit?: number,
  windowMs?: number,
  isAuthAction = false
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // If Upstash isn't configured, bypass gracefully to avoid crashing the app
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { allowed: true }; 
  }

  try {
    const limiter = isAuthAction ? authRatelimit : globalRatelimit;
    // We append the ratelimit prefix for Redis keys
    const { success, reset } = await limiter.limit(`ratelimit_${key}`);
    
    if (!success) {
      auditLogger.warn("Rate limit exceeded", key);
    }
    
    return { 
      allowed: success,
      retryAfter: !success ? Math.ceil((reset - Date.now()) / 1000) : undefined
    };
  } catch (error) {
    auditLogger.error("Rate limiter failed to connect", key, { error });
    // Fail open so users aren't locked out if Redis goes down
    return { allowed: true };
  }
}
