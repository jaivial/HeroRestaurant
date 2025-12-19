import { Elysia } from 'elysia';
import { Errors } from '../utils/errors';

interface RateLimitStore {
  attempts: Map<string, { count: number; resetAt: number }>;
}

const store: RateLimitStore = {
  attempts: new Map(),
};

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  keyPrefix?: string;
}

/**
 * Rate limiter plugin for Elysia
 */
export const rateLimit = (options: RateLimitOptions) => {
  const { maxAttempts, windowMs, keyPrefix = 'rl' } = options;

  return new Elysia({ name: `rate-limit-${keyPrefix}` })
    .onBeforeHandle(({ headers }) => {
      const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';
      const key = `${keyPrefix}:${ip}`;

      const now = Date.now();
      const record = store.attempts.get(key);

      // Clean up expired records
      if (record && now > record.resetAt) {
        store.attempts.delete(key);
      }

      // Get or create record
      const current = store.attempts.get(key);

      if (!current) {
        // First attempt in window
        store.attempts.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
      } else {
        // Increment attempt count
        current.count++;

        if (current.count > maxAttempts) {
          const resetIn = Math.ceil((current.resetAt - now) / 1000);
          throw new Errors.RATE_LIMITED.constructor(
            'RATE_LIMITED',
            `Too many requests. Try again in ${resetIn} seconds.`,
            429
          );
        }
      }
    });
};

/**
 * Login-specific rate limiter plugin
 * Tracks by IP only in onBeforeHandle (before body parsing)
 * Email-based limiting is handled in the auth service after body is available
 */
export const loginRateLimit = new Elysia({ name: 'login-rate-limit' })
  .onBeforeHandle(({ headers }) => {
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';

    // Rate limit by IP (20 attempts per 15 minutes)
    const ipKey = `login:ip:${ip}`;
    const now = Date.now();
    const ipRecord = store.attempts.get(ipKey);

    if (!ipRecord || now > ipRecord.resetAt) {
      store.attempts.set(ipKey, {
        count: 1,
        resetAt: now + 15 * 60 * 1000, // 15 minutes
      });
    } else {
      ipRecord.count++;
      if (ipRecord.count > 20) {
        throw Errors.RATE_LIMITED;
      }
    }
  });

/**
 * Cleanup expired rate limit records (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of store.attempts.entries()) {
    if (now > record.resetAt) {
      store.attempts.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
