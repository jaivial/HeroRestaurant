import { Elysia, t } from 'elysia';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { MembershipRepository } from '../repositories/membership.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { validateSession } from '../middleware/session.middleware';
import { loginRateLimit } from '../middleware/rate-limit.middleware';
import {
  toUserBasic,
  toUserWithFlags,
  toSessionDTO,
  toSessionMe,
  toSessionListItem,
  toRestaurantMinimal,
} from '../utils/transformers';
// Errors are thrown by validateSession middleware

/**
 * Get user's restaurants with access flags
 */
async function getUserRestaurants(userId: string) {
  const memberships = await MembershipRepository.findByUserId(userId);

  const restaurants = await Promise.all(
    memberships.map(async (membership) => {
      const restaurant = await RestaurantRepository.findById(membership.restaurant_id);
      if (!restaurant) return null;

      return {
        ...toRestaurantMinimal(restaurant),
        accessFlags: membership.access_flags.toString(),
        rolePriority: membership.role_priority,
      };
    })
  );

  return restaurants.filter((r): r is NonNullable<typeof r> => r !== null);
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Global error handler for auth routes
  .onError(({ error, set }) => {
    console.error('Auth route error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Check if it's a known error with code
    if ('code' in error && 'statusCode' in error) {
      const knownError = error as { code: string; message: string; statusCode: number };
      set.status = knownError.statusCode;
      return {
        success: false,
        error: {
          code: knownError.code,
          message: knownError.message,
        },
      };
    }

    // Unknown error - include message in dev
    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  })

  // Public routes with rate limiting
  .use(loginRateLimit)

  .post('/register', async ({ body, headers, set }) => {
    const ip = headers['x-forwarded-for']?.toString() || headers['x-real-ip']?.toString();
    const { user, sessionId, session } = await AuthService.register(body, ip);

    set.status = 201;
    return {
      success: true,
      data: {
        user: toUserBasic(user),
        session: toSessionDTO(sessionId, session),
        restaurants: [], // New users have no restaurants yet
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
    console.log('[LOGIN] Request received for:', body.email);
    const ip = headers['x-forwarded-for']?.toString() || headers['x-real-ip']?.toString();
    
    console.log('[LOGIN] Calling AuthService.login...');
    const { user, sessionId, session } = await AuthService.login(body, ip);
    console.log('[LOGIN] AuthService.login success, user:', user.id);

    // Get user's restaurants
    console.log('[LOGIN] Fetching user restaurants...');
    const restaurants = await getUserRestaurants(user.id);
    console.log('[LOGIN] Found restaurants:', restaurants.length);

    return {
      success: true,
      data: {
        user: toUserWithFlags(user),
        session: toSessionDTO(sessionId, session),
        restaurants,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
      deviceInfo: t.Optional(t.String()),
    }),
  })

  // Protected routes - derive session context
  .derive(async ({ headers }) => {
    const context = await validateSession(headers);
    return {
      user: context.user,
      session: context.session,
      sessionId: context.sessionId,
      userId: context.userId,
      globalFlags: context.globalFlags,
      currentRestaurantId: context.currentRestaurantId,
    };
  })

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
    // Get user's restaurants
    const restaurants = await getUserRestaurants(user.id);

    return {
      success: true,
      data: {
        user: toUserWithFlags(user),
        session: toSessionMe(session),
        restaurants,
      },
    };
  })

  .get('/sessions', async ({ userId, sessionId }) => {
    const sessions = await SessionService.getActiveSessionsForUser(userId);
    return {
      success: true,
      data: {
        sessions: sessions.map((s) => toSessionListItem(s, sessionId)),
      },
    };
  })

  .delete('/sessions/:id', async ({ sessionId, set, params }) => {
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
