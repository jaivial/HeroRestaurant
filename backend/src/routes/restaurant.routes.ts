import { Hono } from 'hono';
import { RestaurantHandler } from '../handlers/restaurant.handler';
import { MembershipHandler } from '../handlers/membership.handler';
import { sessionMiddleware } from '../middleware/session.middleware';
import { requirePermissions, requireRestaurantMembership } from '../middleware/permission.middleware';
import { GLOBAL_FLAGS, MEMBER_FLAGS } from '../constants/permissions';

const restaurants = new Hono();

// All routes require authentication
restaurants.use('/*', sessionMiddleware);

// Restaurant CRUD
restaurants.post('/', requirePermissions({ member: GLOBAL_FLAGS.MEMBER_CREATE_RESTAURANT }), RestaurantHandler.create);
restaurants.get('/', RestaurantHandler.list);
restaurants.get('/:id', requireRestaurantMembership(), RestaurantHandler.getById);
restaurants.patch('/:id', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_EDIT_SETTINGS }), RestaurantHandler.update);
restaurants.delete('/:id', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_DELETE_RESTAURANT }), RestaurantHandler.delete);

// Member management
restaurants.get('/:restaurantId/members', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_VIEW_MEMBERS }), MembershipHandler.list);
restaurants.post('/:restaurantId/members', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_INVITE_MEMBERS }), MembershipHandler.create);
restaurants.patch('/:restaurantId/members/:userId', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_MANAGE_MEMBERS }), MembershipHandler.update);
restaurants.delete('/:restaurantId/members/:userId', requirePermissions({ restaurant: MEMBER_FLAGS.CAN_REMOVE_MEMBERS }), MembershipHandler.delete);

export { restaurants };
