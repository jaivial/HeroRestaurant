import { Elysia, t } from 'elysia';
import { RestaurantService } from '../services/restaurant.service';
import { MembershipService } from '../services/membership.service';
import { sessionMiddleware } from '../middleware/session.middleware';
import { PermissionService } from '../services/permission.service';
import { GLOBAL_FLAGS, MEMBER_FLAGS } from '../constants/permissions';
import { Errors } from '../utils/errors';

export const restaurantRoutes = new Elysia({ prefix: '/restaurants' })
  // All routes require authentication
  .use(sessionMiddleware)

  // Create restaurant
  .post('/', async ({ user, body, set }) => {
    // Check permission
    if (!PermissionService.hasGlobalPermission(user.global_flags, GLOBAL_FLAGS.MEMBER_CREATE_RESTAURANT)) {
      throw Errors.FORBIDDEN;
    }

    const restaurant = await RestaurantService.create(user.id, body);
    set.status = 201;

    return {
      success: true,
      data: { restaurant },
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
  .get('/', async ({ userId }) => {
    const restaurants = await RestaurantService.listForUser(userId);
    return {
      success: true,
      data: { restaurants },
    };
  })

  // Get restaurant by ID
  .get('/:id', async ({ params, userId }) => {
    const restaurant = await RestaurantService.getById(params.id, userId);
    return {
      success: true,
      data: { restaurant },
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  // Update restaurant
  .patch('/:id', async ({ params, userId, body }) => {
    // Check permission
    const membership = await MembershipService.getMembership(userId, params.id);
    if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_EDIT_SETTINGS)) {
      throw Errors.FORBIDDEN;
    }

    const restaurant = await RestaurantService.update(params.id, body);
    return {
      success: true,
      data: { restaurant },
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
  .delete('/:id', async ({ params, userId }) => {
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
  .get('/:id/members', async ({ params, userId }) => {
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

  .post('/:id/members', async ({ params, userId, body, set }) => {
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

  .patch('/:id/members/:memberId', async ({ params, userId: currentUserId, body }) => {
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

  .delete('/:id/members/:memberId', async ({ params, userId: currentUserId }) => {
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
