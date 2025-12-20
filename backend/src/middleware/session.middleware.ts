import { SessionService } from '../services/session.service';
import { Errors } from '../utils/errors';
import type { User, Session } from '../types/database.types';

/**
 * Session context type for routes using session validation
 */
export interface SessionContext {
  user: User;
  session: Session;
  sessionId: string;
  userId: string;
  globalFlags: bigint;
  currentRestaurantId: string | null;
}

/**
 * Validates session from Authorization header or query parameter and returns session context
 * Use this function in derive() or as a helper in route handlers
 */
export async function validateSession(
  headers: Record<string, string | undefined>,
  query?: Record<string, string | undefined>
): Promise<SessionContext> {
  console.log('[WS DEBUG] validateSession starting...');
  // Try to get session ID from Authorization header first
  const authHeader = headers.authorization;
  let tokenId: string | undefined;

  if (authHeader) {
    // Expected format: "Session <session-id>"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Session') {
      tokenId = parts[1];
    }
  }

  // Fallback to query parameter (useful for WebSocket upgrades)
  if (!tokenId && query?.token) {
    console.log('[WS DEBUG] Found token in query params');
    tokenId = query.token;
  }

  if (!tokenId) {
    console.warn('[WS DEBUG] No session token found in headers or query');
    throw Errors.SESSION_REQUIRED;
  }

  // Validate session and get user (session is automatically extended if needed)
  const { user, session } = await SessionService.validate(tokenId);

  // Defensive check - should never happen as validate() throws if user not found
  if (!user || !session) {
    throw Errors.SESSION_INVALID;
  }

  return {
    user,
    session,
    sessionId: session.id,
    userId: user.id,
    globalFlags: user.global_flags,
    currentRestaurantId: session.current_restaurant_id,
  };
}

/**
 * Optional session validation - returns null values instead of throwing
 */
export async function validateSessionOptional(headers: Record<string, string | undefined>): Promise<SessionContext | null> {
  const authHeader = headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Session' || !parts[1]) {
    return null;
  }

  try {
    return await validateSession(headers);
  } catch {
    return null;
  }
}

/**
 * Elysia middleware that validates session and adds session context to the request
 */
import { Elysia } from 'elysia';

export const sessionMiddleware = new Elysia({ name: 'session-middleware' })
  .derive(async ({ headers, query }) => {
    const context = await validateSession(headers, query as Record<string, string | undefined>);
    return {
      user: context.user,
      session: context.session,
      sessionId: context.sessionId,
      userId: context.userId,
      globalFlags: context.globalFlags,
      currentRestaurantId: context.currentRestaurantId,
    };
  });
