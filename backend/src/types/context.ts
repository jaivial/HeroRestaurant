/**
 * Elysia Context Types
 *
 * Type definitions for custom context properties added by middleware
 */

import type { User, Session } from './database.types';

/**
 * Context properties added by sessionMiddleware
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
 * Optional session context (for routes that may or may not have auth)
 */
export interface OptionalSessionContext {
  user: User | null;
  session: Session | null;
  sessionId: string | null;
  userId: string | null;
  globalFlags: bigint | null;
  currentRestaurantId: string | null;
}
