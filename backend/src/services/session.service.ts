import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { generateSessionId, hashSessionId } from '../utils/session-id';
import { Errors } from '../utils/errors';
import type { Session, User } from '../types/database.types';

const SESSION_DURATION_HOURS = 21;
const EXTENSION_THRESHOLD_MINUTES = 5;

export class SessionService {
  /**
   * Creates a new session for a user
   * Returns the plain session ID (to be sent to client) and the session record
   */
  static async create(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
    restaurantId?: string
  ): Promise<{ sessionId: string; session: Session }> {
    const sessionId = generateSessionId();
    const hashedSessionId = await hashSessionId(sessionId);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

    const session = await SessionRepository.create({
      hashed_session_id: hashedSessionId,
      user_id: userId,
      current_restaurant_id: restaurantId ?? null,
      device_info: deviceInfo ?? null,
      ip_address: ipAddress ?? null,
      expires_at: expiresAt,
      revoked_at: null,
      revocation_reason: null,
    });

    return { sessionId, session };
  }

  /**
   * Validates a session and returns the user
   * Automatically extends the session if needed
   */
  static async validate(sessionId: string): Promise<{ user: User; session: Session }> {
    const hashedSessionId = await hashSessionId(sessionId);
    const session = await SessionRepository.findByHashedId(hashedSessionId);

    if (!session) {
      throw Errors.SESSION_INVALID;
    }

    // Check if session is revoked
    if (session.revoked_at) {
      throw Errors.SESSION_REVOKED;
    }

    // Check if session is expired
    if (new Date() > new Date(session.expires_at)) {
      throw Errors.SESSION_EXPIRED;
    }

    // Get user
    const user = await UserRepository.findById(session.user_id);
    if (!user) {
      throw Errors.SESSION_INVALID;
    }

    // Check user status
    if (user.status === 'suspended') {
      throw Errors.AUTH_ACCOUNT_DISABLED;
    }

    // Extend session if needed (in background)
    this.maybeExtendSession(session);

    return { user, session };
  }

  /**
   * Extends session expiry if last activity was more than threshold minutes ago
   * This reduces database writes while maintaining sliding expiration
   */
  private static async maybeExtendSession(session: Session): Promise<void> {
    const lastActivity = new Date(session.last_activity_at);
    const now = new Date();
    const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    if (minutesSinceActivity >= EXTENSION_THRESHOLD_MINUTES) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + SESSION_DURATION_HOURS);

      // Fire and forget - if this fails, session just expires sooner
      SessionRepository.extendExpiry(session.id, newExpiresAt).catch(() => {
        // Silently fail
      });
    }
  }

  /**
   * Revokes a specific session
   */
  static async revoke(
    sessionId: string,
    reason: 'logout' | 'password_change' | 'security' | 'admin_action'
  ): Promise<void> {
    await SessionRepository.revoke(sessionId, reason);
  }

  /**
   * Revokes all sessions for a user
   */
  static async revokeAllForUser(
    userId: string,
    reason: 'logout' | 'password_change' | 'security' | 'admin_action',
    exceptSessionId?: string
  ): Promise<number> {
    return await SessionRepository.revokeAllByUserId(userId, reason, exceptSessionId);
  }

  /**
   * Gets all active sessions for a user
   */
  static async getActiveSessionsForUser(userId: string): Promise<Session[]> {
    return await SessionRepository.findActiveByUserId(userId);
  }

  /**
   * Updates the restaurant context for a session
   */
  static async updateRestaurantContext(sessionId: string, restaurantId: string | null): Promise<void> {
    await SessionRepository.updateRestaurantContext(sessionId, restaurantId);
  }
}
