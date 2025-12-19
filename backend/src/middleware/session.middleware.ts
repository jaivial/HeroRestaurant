import type { Context, Next } from 'hono';
import { SessionService } from '../services/session.service';
import { AppError, Errors } from '../utils/errors';

/**
 * Session middleware - validates session and populates request context
 * Extracts session ID from Authorization header (format: "Session <session-id>")
 */
export async function sessionMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      throw Errors.SESSION_REQUIRED;
    }

    // Expected format: "Session <session-id>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Session') {
      throw Errors.SESSION_INVALID;
    }

    const sessionId = parts[1];
    if (!sessionId) {
      throw Errors.SESSION_INVALID;
    }

    // Validate session and get user
    const { user, session } = await SessionService.validate(sessionId);

    // Populate context
    c.set('userId', user.id);
    c.set('user', user);
    c.set('session', session);
    c.set('sessionId', session.id);
    c.set('memberFlags', user.member_flags);

    if (session.current_restaurant_id) {
      c.set('currentRestaurantId', session.current_restaurant_id);
    }

    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw Errors.SESSION_INVALID;
  }
}

/**
 * Optional session middleware - validates session if present, but doesn't require it
 */
export async function optionalSessionMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Session' && parts[1]) {
        const sessionId = parts[1];
        const { user, session } = await SessionService.validate(sessionId);

        c.set('userId', user.id);
        c.set('user', user);
        c.set('session', session);
        c.set('sessionId', session.id);
        c.set('memberFlags', user.member_flags);

        if (session.current_restaurant_id) {
          c.set('currentRestaurantId', session.current_restaurant_id);
        }
      }
    }

    await next();
  } catch {
    // Silently continue without session
    await next();
  }
}
