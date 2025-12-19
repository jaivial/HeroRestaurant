import type { WSConnection } from '../state/connections';

const RATE_LIMIT = {
  MESSAGES_PER_WINDOW: 100,  // Max messages per window
  WINDOW_MS: 60_000,         // 1 minute window
};

// Track login attempts by IP for extra protection
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const LOGIN_RATE_LIMIT = {
  ATTEMPTS: 5,               // Max login attempts per window
  WINDOW_MS: 300_000,        // 5 minute window
};

/**
 * Check if the connection has exceeded rate limits
 * Returns error message if rate limited, null otherwise
 */
export function checkRateLimit(ws: WSConnection): string | null {
  const now = Date.now();
  const { messageCount, windowStart } = ws.data;

  // Reset window if expired
  if (now - windowStart > RATE_LIMIT.WINDOW_MS) {
    ws.data.messageCount = 1;
    ws.data.windowStart = now;
    return null;
  }

  // Increment and check
  ws.data.messageCount = messageCount + 1;

  if (ws.data.messageCount > RATE_LIMIT.MESSAGES_PER_WINDOW) {
    return 'Too many messages. Please slow down.';
  }

  return null;
}

/**
 * Check login-specific rate limit (by IP)
 * Returns error message if rate limited, null otherwise
 */
export function checkLoginRateLimit(ip: string | null): string | null {
  if (!ip) return null; // Can't rate limit without IP

  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_RATE_LIMIT.WINDOW_MS });
    return null;
  }

  record.count++;

  if (record.count > LOGIN_RATE_LIMIT.ATTEMPTS) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return `Too many login attempts. Please try again in ${waitSeconds} seconds.`;
  }

  return null;
}

/**
 * Clear login attempts for an IP on successful login
 */
export function clearLoginAttempts(ip: string | null): void {
  if (ip) {
    loginAttempts.delete(ip);
  }
}

// Cleanup old records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now > record.resetAt) {
      loginAttempts.delete(key);
    }
  }
}, 60_000);
