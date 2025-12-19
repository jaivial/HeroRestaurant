import { Elysia } from 'elysia';
import { SessionService } from '../services/session.service';
import { UserRepository } from '../repositories/user.repository';
import { Errors } from '../utils/errors';

/**
 * Session middleware plugin for Elysia
 * Validates session and attaches user/session to context
 */
export const sessionMiddleware = new Elysia({ name: 'session' })
  .derive(async ({ headers }) => {
    // Get session ID from Authorization header
    const authHeader = headers.authorization;
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

    // Extend session (sliding window)
    await SessionService.extend(session.id);

    return {
      user,
      session,
      sessionId: session.id,
      userId: user.id,
      globalFlags: user.global_flags,
      currentRestaurantId: session.current_restaurant_id,
    };
  });

/**
 * Optional session middleware - doesn't throw if no session
 */
export const optionalSessionMiddleware = new Elysia({ name: 'optional-session' })
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader) {
      return { user: null, session: null, sessionId: null, userId: null, globalFlags: null, currentRestaurantId: null };
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Session' || !parts[1]) {
      return { user: null, session: null, sessionId: null, userId: null, globalFlags: null, currentRestaurantId: null };
    }

    try {
      const sessionId = parts[1];
      const { user, session } = await SessionService.validate(sessionId);
      await SessionService.extend(session.id);

      return {
        user,
        session,
        sessionId: session.id,
        userId: user.id,
        globalFlags: user.global_flags,
        currentRestaurantId: session.current_restaurant_id,
      };
    } catch {
      return { user: null, session: null, sessionId: null, userId: null, globalFlags: null, currentRestaurantId: null };
    }
  });
