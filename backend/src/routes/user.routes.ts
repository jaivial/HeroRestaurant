import { Elysia, t } from 'elysia';
import { UserService } from '../services/user.service';
import { sessionMiddleware } from '../middleware/session.middleware';

export const userRoutes = new Elysia({ prefix: '/users' })
  // All user routes require authentication
  .use(sessionMiddleware)

  .get('/me', async ({ user }) => {
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          globalFlags: user.global_flags.toString(),
          avatarUrl: user.avatar_url,
          phone: user.phone,
          emailVerifiedAt: user.email_verified_at?.toISOString() || null,
          status: user.status,
          createdAt: user.created_at.toISOString(),
        },
      },
    };
  })

  .patch('/me', async ({ user, body }) => {
    const updatedUser = await UserService.updateProfile(user.id, body);

    return {
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          globalFlags: updatedUser.global_flags.toString(),
          avatarUrl: updatedUser.avatar_url,
          phone: updatedUser.phone,
        },
      },
    };
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      avatarUrl: t.Optional(t.Union([t.String(), t.Null()])),
      phone: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  });
