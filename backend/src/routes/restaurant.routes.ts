import { Elysia, t } from 'elysia';
import { RestaurantService } from '../services/restaurant.service';
import { MembershipService } from '../services/membership.service';
import { sessionMiddleware, type SessionContext } from '../middleware/session.middleware';
import { PermissionService } from '../services/permission.service';
import { GLOBAL_FLAGS, MEMBER_FLAGS } from '../constants/permissions';
import { Errors } from '../utils/errors';
import { toRestaurant } from '../utils/transformers';

export const restaurantRoutes = new Elysia({ prefix: '/restaurants' })
  // All routes require authentication
  .use(sessionMiddleware)

  // Create restaurant
  .post('/', async (ctx) => {
    const { user, body, set } = ctx as unknown as SessionContext & {
      body: { name: string; slug?: string; description?: string; timezone?: string; currency?: string };
      set: { status: number };
    };

    // Check permission
    if (!PermissionService.hasGlobalPermission(user.global_flags, GLOBAL_FLAGS.CREATE_RESTAURANT)) {
      throw Errors.FORBIDDEN;
    }

    const restaurant = await RestaurantService.create(user.id, body);
    set.status = 201;

    return {
      success: true,
      data: { restaurant: toRestaurant(restaurant) },
    };
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      slug: t.Optional(t.String()),
      description: t.Optional(t.String()),
      timezone: t.Optional(t.String()),
      currency: t.Optional(t.String()),
    }),
  })

  // List restaurants for current user
  .get('/', async (ctx) => {
    const { userId } = ctx as unknown as SessionContext;
    const restaurants = await RestaurantService.listForUser(userId);
    return {
      success: true,
      data: { restaurants: restaurants.map(toRestaurant) },
    };
  })

  // Get restaurant by ID
  .get('/:id', async (ctx) => {
    const { userId, params } = ctx as unknown as SessionContext & { params: { id: string } };
    const restaurant = await RestaurantService.getById(params.id, userId);
    return {
      success: true,
      data: { restaurant: toRestaurant(restaurant) },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  // Update restaurant
  .patch('/:id', async (ctx) => {
    const { userId, params, body } = ctx as unknown as SessionContext & {
      params: { id: string };
      body: { name?: string; description?: string; logoUrl?: string | null; coverImageUrl?: string | null; timezone?: string; currency?: string };
    };

    // Check permission
    const membership = await MembershipService.getMembership(userId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_EDIT_SETTINGS)) {
      throw Errors.FORBIDDEN;
    }

    const restaurant = await RestaurantService.update(params.id, body);
    return {
      success: true,
      data: { restaurant: toRestaurant(restaurant) },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      description: t.Optional(t.String()),
      logoUrl: t.Optional(t.Union([t.String(), t.Null()])),
      coverImageUrl: t.Optional(t.Union([t.String(), t.Null()])),
      timezone: t.Optional(t.String()),
      currency: t.Optional(t.String()),
    }),
  })

  // Delete restaurant
  .delete('/:id', async (ctx) => {
    const { userId, params } = ctx as unknown as SessionContext & { params: { id: string } };
    const membership = await MembershipService.getMembership(userId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_DELETE_RESTAURANT)) {
      throw Errors.FORBIDDEN;
    }

    await RestaurantService.delete(params.id);
    return {
      success: true,
      data: { message: 'Restaurant deleted successfully' },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  // Member management
  .get('/:id/members', async (ctx) => {
    const { userId, params } = ctx as unknown as SessionContext & { params: { id: string } };
    const membership = await MembershipService.getMembership(userId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_MEMBERS)) {
      throw Errors.FORBIDDEN;
    }

    const members = await MembershipService.listMembers(params.id);
    return {
      success: true,
      data: { members },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  .post('/:id/members', async (ctx) => {
    const { userId, params, body, set } = ctx as unknown as SessionContext & {
      params: { id: string };
      body: { email: string; roleId?: string };
      set: { status: number };
    };

    const membership = await MembershipService.getMembership(userId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_INVITE_MEMBERS)) {
      throw Errors.FORBIDDEN;
    }

    const member = await MembershipService.inviteMember(params.id, body, userId);
    set.status = 201;

    return {
      success: true,
      data: { member },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      email: t.String({ format: 'email' }),
      roleId: t.Optional(t.String()),
    }),
  })

  .patch('/:id/members/:memberId', async (ctx) => {
    const { userId: currentUserId, params, body } = ctx as unknown as SessionContext & {
      params: { id: string; memberId: string };
      body: { roleId?: string; accessFlags?: string; status?: 'active' | 'suspended' };
    };

    const membership = await MembershipService.getMembership(currentUserId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_MEMBERS)) {
      throw Errors.FORBIDDEN;
    }

    const member = await MembershipService.updateMember(params.id, params.memberId, body);
    return {
      success: true,
      data: { member },
    };
  }, {
    params: t.Object({
      id: t.String(),
      memberId: t.String(),
    }),
    body: t.Object({
      roleId: t.Optional(t.String()),
      accessFlags: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal('active'), t.Literal('suspended')])),
    }),
  })

  .delete('/:id/members/:memberId', async (ctx) => {
    const { userId: currentUserId, params } = ctx as unknown as SessionContext & {
      params: { id: string; memberId: string };
    };

    const membership = await MembershipService.getMembership(currentUserId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_REMOVE_MEMBERS)) {
      throw Errors.FORBIDDEN;
    }

    await MembershipService.removeMember(params.id, params.memberId);
    return {
      success: true,
      data: { message: 'Member removed successfully' },
    };
  }, {
    params: t.Object({
      id: t.String(),
      memberId: t.String(),
    }),
  });
