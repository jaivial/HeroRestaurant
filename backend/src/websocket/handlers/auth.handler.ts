import type { WSConnection } from '../state/connections';
import { connectionManager } from '../state/connections';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { MembershipRepository } from '../../repositories/membership.repository';
import { RestaurantRepository } from '../../repositories/restaurant.repository';
import {
  toUserBasic,
  toUserWithFlags,
  toSessionDTO,
  toSessionMe,
  toSessionListItem,
  toRestaurantMinimal,
} from '../../utils/transformers';
import { checkLoginRateLimit, clearLoginAttempts } from '../middleware/rate-limit.ws';
import { createEvent } from '../../types/websocket.types';
import type {
  RegisterPayload,
  LoginPayload,
  AuthenticatePayload,
  SessionRevokePayload,
} from '../../types/websocket.types';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const authHandlers = {
  /**
   * Register a new user
   */
  async register(ws: WSConnection, payload: unknown): HandlerResult {
    const { email, password, name } = payload as RegisterPayload;

    try {
      const { user, sessionId, session } = await AuthService.register(
        { email, password, name },
        ws.data.ipAddress ?? undefined
      );

      // Authenticate the connection
      connectionManager.authenticate(
        ws.data.connectionId,
        user.id,
        sessionId,
        user.global_flags
      );

      return {
        data: {
          user: toUserBasic(user),
          session: toSessionDTO(sessionId, session),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Registration failed',
        },
      };
    }
  },

  /**
   * Login with email and password
   */
  async login(ws: WSConnection, payload: unknown): HandlerResult {
    const { email, password, deviceInfo } = payload as LoginPayload;

    // Check login rate limit
    const rateLimitError = checkLoginRateLimit(ws.data.ipAddress);
    if (rateLimitError) {
      return {
        error: {
          code: 'RATE_LIMITED',
          message: rateLimitError,
        },
      };
    }

    try {
      const { user, sessionId, session } = await AuthService.login(
        { email, password, deviceInfo },
        ws.data.ipAddress ?? undefined
      );

      // Clear login attempts on success
      clearLoginAttempts(ws.data.ipAddress);

      // Authenticate the connection
      connectionManager.authenticate(
        ws.data.connectionId,
        user.id,
        sessionId,
        user.global_flags
      );

      // Get user's restaurants for initial load
      const memberships = await MembershipRepository.findByUserId(user.id);
      const restaurants = await Promise.all(
        memberships
          .filter((m) => m.status === 'active')
          .map(async (m) => {
            const restaurant = await RestaurantRepository.findById(m.restaurant_id);
            return restaurant ? { restaurant, accessFlags: m.access_flags } : null;
          })
      );

      const validRestaurants = restaurants.filter((r): r is NonNullable<typeof r> => r !== null);

      return {
        data: {
          user: toUserWithFlags(user),
          session: toSessionDTO(sessionId, session),
          restaurants: validRestaurants.map((r) => ({
            ...toRestaurantMinimal(r.restaurant),
            accessFlags: r.accessFlags.toString(),
          })),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Login failed',
        },
      };
    }
  },

  /**
   * Authenticate connection with existing session token
   */
  async authenticate(ws: WSConnection, payload: unknown): HandlerResult {
    const { sessionToken } = payload as AuthenticatePayload;

    try {
      const { user, session } = await SessionService.validate(sessionToken);

      // Authenticate the connection
      connectionManager.authenticate(
        ws.data.connectionId,
        user.id,
        sessionToken,
        user.global_flags
      );

      // Get user's restaurants
      const memberships = await MembershipRepository.findByUserId(user.id);
      const restaurants = await Promise.all(
        memberships
          .filter((m) => m.status === 'active')
          .map(async (m) => {
            const restaurant = await RestaurantRepository.findById(m.restaurant_id);
            return restaurant ? { restaurant, accessFlags: m.access_flags } : null;
          })
      );

      const validRestaurants = restaurants.filter((r): r is NonNullable<typeof r> => r !== null);

      return {
        data: {
          user: toUserWithFlags(user),
          session: toSessionMe(session),
          restaurants: validRestaurants.map((r) => ({
            ...toRestaurantMinimal(r.restaurant),
            accessFlags: r.accessFlags.toString(),
          })),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'SESSION_INVALID',
          message: error.message || 'Session authentication failed',
        },
      };
    }
  },

  /**
   * Logout current session
   */
  async logout(ws: WSConnection): HandlerResult {
    const { sessionId } = ws.data;

    if (!sessionId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      await AuthService.logout(sessionId);
      connectionManager.deauthenticate(ws.data.connectionId);

      return {
        data: { message: 'Logged out successfully' },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Logout failed',
        },
      };
    }
  },

  /**
   * Logout all sessions for current user
   */
  async logoutAll(ws: WSConnection): HandlerResult {
    const { userId, sessionId } = ws.data;

    if (!userId || !sessionId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const sessionsRevoked = await AuthService.logoutAll(userId, sessionId);

      // Notify and disconnect other connections for this user
      const otherConnections = connectionManager.getConnectionsByUserId(userId)
        .filter((conn) => conn.data.connectionId !== ws.data.connectionId);

      const event = createEvent('auth', 'session-expired', {
        reason: 'revoked',
        message: 'All sessions have been logged out',
      });

      for (const conn of otherConnections) {
        try {
          conn.send(JSON.stringify(event));
          conn.close(1000, 'Session revoked by logout-all');
        } catch (e) {
          // Connection may already be closed
        }
      }

      return {
        data: {
          message: 'All sessions logged out',
          sessionsRevoked,
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Logout all failed',
        },
      };
    }
  },

  /**
   * Get current user info
   */
  async me(ws: WSConnection): HandlerResult {
    const { userId, sessionId } = ws.data;

    if (!userId || !sessionId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const { user, session } = await SessionService.validate(sessionId);

      return {
        data: {
          user: toUserWithFlags(user),
          session: toSessionMe(session),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get user info',
        },
      };
    }
  },

  /**
   * List all active sessions
   */
  async sessionList(ws: WSConnection): HandlerResult {
    const { userId, sessionId } = ws.data;

    if (!userId || !sessionId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const sessions = await SessionService.getActiveSessionsForUser(userId);

      return {
        data: {
          sessions: sessions.map((s) => toSessionListItem(s, sessionId)),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to list sessions',
        },
      };
    }
  },

  /**
   * Revoke a specific session
   */
  async sessionRevoke(ws: WSConnection, payload: unknown): HandlerResult {
    const { sessionId: currentSessionId, userId } = ws.data;
    const { sessionId: targetSessionId } = payload as SessionRevokePayload;

    if (!currentSessionId || !userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    if (targetSessionId === currentSessionId) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot revoke current session. Use logout instead.',
        },
      };
    }

    try {
      await SessionService.revoke(targetSessionId, 'logout');

      // Disconnect the revoked session if connected
      const targetConn = connectionManager.getConnectionBySessionId(targetSessionId);
      if (targetConn) {
        const event = createEvent('auth', 'session-expired', {
          reason: 'revoked',
          message: 'Session has been revoked',
        });
        try {
          targetConn.send(JSON.stringify(event));
          targetConn.close(1000, 'Session revoked');
        } catch (e) {
          // Connection may already be closed
        }
      }

      return {
        data: { message: 'Session revoked successfully' },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to revoke session',
        },
      };
    }
  },
};
