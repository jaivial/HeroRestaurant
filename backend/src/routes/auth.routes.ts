import { Elysia, t } from 'elysia';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { sessionMiddleware } from '../middleware/session.middleware';
import { loginRateLimit } from '../middleware/rate-limit.middleware';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Public routes with rate limiting
  .use(loginRateLimit)

  .post('/register', async ({ body, headers, set }) => {
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'];
    const { user, sessionId, session } = await AuthService.register(body, ip);

    set.status = 201;
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          id: sessionId,
          expiresAt: session.expires_at.toISOString(),
        },
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      name: t.String({ minLength: 1 }),
    }),
  })

  .post('/login', async ({ body, headers }) => {
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'];
    const { user, sessionId, session } = await AuthService.login(body, ip);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          globalFlags: user.global_flags.toString(),
        },
        session: {
          id: sessionId,
          expiresAt: session.expires_at.toISOString(),
        },
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
      deviceInfo: t.Optional(t.String()),
    }),
  })

  // Protected routes
  .use(sessionMiddleware)

  .post('/logout', async ({ sessionId }) => {
    await AuthService.logout(sessionId);
    return {
      success: true,
      data: { message: 'Logged out successfully' },
    };
  })

  .post('/logout-all', async ({ userId, sessionId }) => {
    const sessionsRevoked = await AuthService.logoutAll(userId, sessionId);
    return {
      success: true,
      data: {
        message: 'All sessions logged out',
        sessionsRevoked,
      },
    };
  })

  .get('/me', async ({ user, session }) => {
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          globalFlags: user.global_flags.toString(),
          avatarUrl: user.avatar_url,
        },
        session: {
          expiresAt: session.expires_at.toISOString(),
          createdAt: session.created_at.toISOString(),
        },
      },
    };
  })

  .get('/sessions', async ({ userId, sessionId }) => {
    const sessions = await SessionService.getActiveSessionsForUser(userId);
    return {
      success: true,
      data: {
        sessions: sessions.map((session) => ({
          id: session.id,
          deviceInfo: session.device_info,
          lastActivity: session.last_activity_at.toISOString(),
          createdAt: session.created_at.toISOString(),
          current: session.id === sessionId,
        })),
      },
    };
  })

  .delete('/sessions/:id', async ({ params, sessionId, set }) => {
    if (params.id === sessionId) {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: 'Cannot revoke current session. Use /auth/logout instead.',
        },
      };
    }

    await SessionService.revoke(params.id, 'logout');
    return {
      success: true,
      data: { message: 'Session revoked successfully' },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  });
