import { Elysia } from 'elysia';
import { SessionService } from '../services/session.service';
import { Errors } from '../utils/errors';
import type { User, Session } from '../types/database.types';

/**
 * Session context type for routes using sessionMiddleware
 */
export interface SessionContext extends Record<string, unknown> {
  user: User;
  session: Session;
  sessionId: string;
  userId: string;
  globalFlags: bigint;
  currentRestaurantId: string | null;
}

/**
 * Session middleware plugin for Elysia
 * Validates session and attaches user/session to context
 */
export const sessionMiddleware = new Elysia({ name: 'session' })
  .derive(async ({ headers }): Promise<SessionContext> => {
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

    // Validate session and get user (session is automatically extended if needed)
    const { user, session } = await SessionService.validate(sessionId);

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
 * Optional session context type
 */
export interface OptionalSessionContext extends Record<string, unknown> {
  user: User | null;
  session: Session | null;
  sessionId: string | null;
  userId: string | null;
  globalFlags: bigint | null;
  currentRestaurantId: string | null;
}

/**
 * Optional session middleware - doesn't throw if no session
 */
export const optionalSessionMiddleware = new Elysia({ name: 'optional-session' })
  .derive(async ({ headers }): Promise<OptionalSessionContext> => {
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
