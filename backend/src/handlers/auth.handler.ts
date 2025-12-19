import type { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { success, created } from '../utils/response';
import type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, MeResponse, SessionInfo } from '../types/auth.types';
import type { User, Session } from '../types/database.types';

export class AuthHandler {
  /**
   * POST /auth/register
   * Register a new user
   */
  static async register(c: Context) {
    const body = await c.req.json<RegisterRequest>();
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');

    const { user, sessionId, session } = await AuthService.register(body, ip);

    const response: RegisterResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      session: {
        id: sessionId,
        expiresAt: session.expires_at.toISOString(),
      },
    };

    return created(c, response);
  }

  /**
   * POST /auth/login
   * Authenticate and create session
   */
  static async login(c: Context) {
    const body = await c.req.json<LoginRequest>();
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');

    const { user, sessionId, session } = await AuthService.login(body, ip);

    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberFlags: user.member_flags.toString(),
      },
      session: {
        id: sessionId,
        expiresAt: session.expires_at.toISOString(),
      },
    };

    return success(c, response);
  }

  /**
   * POST /auth/logout
   * Revoke current session
   */
  static async logout(c: Context) {
    const sessionId = c.get('sessionId') as string;
    await AuthService.logout(sessionId);

    return success(c, { message: 'Logged out successfully' });
  }

  /**
   * POST /auth/logout-all
   * Revoke all user sessions
   */
  static async logoutAll(c: Context) {
    const userId = c.get('userId') as string;
    const currentSessionId = c.get('sessionId') as string;

    const sessionsRevoked = await AuthService.logoutAll(userId, currentSessionId);

    return success(c, {
      message: 'All sessions logged out',
      sessionsRevoked,
    });
  }

  /**
   * GET /auth/me
   * Get current user info and session status
   */
  static async me(c: Context) {
    const user = c.get('user') as User;
    const session = c.get('session') as Session;

    const response: MeResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberFlags: user.member_flags.toString(),
        avatarUrl: user.avatar_url,
      },
      session: {
        expiresAt: session.expires_at.toISOString(),
        createdAt: session.created_at.toISOString(),
      },
    };

    return success(c, response);
  }

  /**
   * GET /auth/sessions
   * List all active sessions for current user
   */
  static async sessions(c: Context) {
    const userId = c.get('userId') as string;
    const currentSessionId = c.get('sessionId') as string;

    const sessions = await SessionService.getActiveSessionsForUser(userId);

    const sessionInfos: SessionInfo[] = sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.device_info,
      lastActivity: session.last_activity_at.toISOString(),
      createdAt: session.created_at.toISOString(),
      current: session.id === currentSessionId,
    }));

    return success(c, { sessions: sessionInfos });
  }

  /**
   * DELETE /auth/sessions/:id
   * Revoke a specific session
   */
  static async revokeSession(c: Context) {
    const sessionIdToRevoke = c.req.param('id');
    const currentSessionId = c.get('sessionId') as string;

    // Cannot revoke current session via this endpoint
    if (sessionIdToRevoke === currentSessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_OPERATION',
            message: 'Cannot revoke current session. Use /auth/logout instead.',
          },
        },
        400
      );
    }

    await SessionService.revoke(sessionIdToRevoke, 'logout');

    return success(c, { message: 'Session revoked successfully' });
  }
}
