import type { Context, Next } from 'hono';
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
 * Simple in-memory rate limiter
 * In production, use Redis for distributed rate limiting
 */
export function rateLimit(options: RateLimitOptions) {
  const { maxAttempts, windowMs, keyPrefix = 'rl' } = options;

  return async (c: Context, next: Next) => {
    // Get client IP
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
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

    await next();
  };
}

/**
 * Login-specific rate limiter
 * Tracks by both IP and email
 * Note: Parses body and stores it in context for handler to use
 */
export function loginRateLimit() {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

    // Clone the request to read body without consuming it
    const clonedReq = c.req.raw.clone();
    let body: { email?: string } = {};
    try {
      body = await clonedReq.json();
      // Store parsed body in context for handler to use
      c.set('parsedBody', body);
    } catch {
      // If body parsing fails, let the handler deal with it
    }

    const email = body.email?.toLowerCase();

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

    // Rate limit by email (5 attempts per 15 minutes)
    if (email) {
      const emailKey = `login:email:${email}`;
      const emailRecord = store.attempts.get(emailKey);

      if (!emailRecord || now > emailRecord.resetAt) {
        store.attempts.set(emailKey, {
          count: 1,
          resetAt: now + 15 * 60 * 1000,
        });
      } else {
        emailRecord.count++;
        if (emailRecord.count > 5) {
          throw Errors.AUTH_ACCOUNT_LOCKED;
        }
      }
    }

    await next();
  };
}

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
