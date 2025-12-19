import { Elysia, t } from 'elysia';
import { UserService } from '../services/user.service';
import { sessionMiddleware, type SessionContext } from '../middleware/session.middleware';
import { toUserProfile, toUserWithFlags } from '../utils/transformers';

export const userRoutes = new Elysia({ prefix: '/users' })
  // All user routes require authentication
  .use(sessionMiddleware)

  .get('/me', async (ctx) => {
    const { user } = ctx as unknown as SessionContext;
    return {
      success: true,
      data: {
        user: toUserProfile(user),
      },
    };
  })

  .patch('/me', async (ctx) => {
    const { user, body } = ctx as unknown as SessionContext & { body: { name?: string; avatarUrl?: string | null; phone?: string | null } };
    const updatedUser = await UserService.update(user.id, {
      name: body.name,
      avatar_url: body.avatarUrl,
      phone: body.phone,
    });

    return {
      success: true,
      data: {
        user: toUserWithFlags(updatedUser),
      },
    };
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      avatarUrl: t.Optional(t.Union([t.String(), t.Null()])),
      phone: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  });
