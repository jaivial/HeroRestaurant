import { Elysia, t } from 'elysia';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { sessionMiddleware, type SessionContext } from '../middleware/session.middleware';
import { loginRateLimit } from '../middleware/rate-limit.middleware';
import {
  toUserBasic,
  toUserWithFlags,
  toSessionDTO,
  toSessionMe,
  toSessionListItem,
} from '../utils/transformers';

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
        user: toUserBasic(user),
        session: toSessionDTO(sessionId, session),
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
        user: toUserWithFlags(user),
        session: toSessionDTO(sessionId, session),
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
      deviceInfo: t.Optional(t.String()),
    }),
  })

  // Protected routes - use sessionMiddleware
  .use(sessionMiddleware)

  .post('/logout', async (ctx) => {
    const { sessionId } = ctx as unknown as SessionContext;
    await AuthService.logout(sessionId);
    return {
      success: true,
      data: { message: 'Logged out successfully' },
    };
  })

  .post('/logout-all', async (ctx) => {
    const { userId, sessionId } = ctx as unknown as SessionContext;
    const sessionsRevoked = await AuthService.logoutAll(userId, sessionId);
    return {
      success: true,
      data: {
        message: 'All sessions logged out',
        sessionsRevoked,
      },
    };
  })

  .get('/me', async (ctx) => {
    const { user, session } = ctx as unknown as SessionContext;
    return {
      success: true,
      data: {
        user: toUserWithFlags(user),
        session: toSessionMe(session),
      },
    };
  })

  .get('/sessions', async (ctx) => {
    const { userId, sessionId } = ctx as unknown as SessionContext;
    const sessions = await SessionService.getActiveSessionsForUser(userId);
    return {
      success: true,
      data: {
        sessions: sessions.map((session) => toSessionListItem(session, sessionId)),
      },
    };
  })

  .delete('/sessions/:id', async (ctx) => {
    const { sessionId, set, params } = ctx as unknown as SessionContext & { set: { status: number }; params: { id: string } };
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
