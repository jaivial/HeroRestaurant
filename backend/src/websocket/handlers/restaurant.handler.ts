import type { WSConnection } from '../state/connections';
import { RestaurantService } from '../../services/restaurant.service';
import { MembershipService } from '../../services/membership.service';
import { PermissionService } from '../../services/permission.service';
import { GLOBAL_FLAGS, MEMBER_FLAGS } from '../../constants/permissions';
import { toRestaurant } from '../../utils/transformers';
import type {
  RestaurantCreatePayload,
  RestaurantGetPayload,
  RestaurantUpdatePayload,
  RestaurantDeletePayload,
} from '../../types/websocket.types';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const restaurantHandlers = {
  /**
   * Create a new restaurant
   */
  async create(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId, globalFlags } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    // Check global permission
    if (!PermissionService.hasGlobalPermission(globalFlags, GLOBAL_FLAGS.CREATE_RESTAURANT)) {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to create restaurants',
        },
      };
    }

    const { name, slug, description, timezone, currency } = payload as RestaurantCreatePayload;

    try {
      const restaurant = await RestaurantService.create(userId, {
        name,
        slug,
        description,
        timezone,
        currency,
      });

      return {
        data: {
          restaurant: toRestaurant(restaurant),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to create restaurant',
        },
      };
    }
  },

  /**
   * List all restaurants for current user
   */
  async list(ws: WSConnection): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const restaurants = await RestaurantService.listForUser(userId);

      return {
        data: {
          restaurants: restaurants.map(toRestaurant),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to list restaurants',
        },
      };
    }
  },

  /**
   * Get a restaurant by ID
   */
  async get(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId } = payload as RestaurantGetPayload;

    try {
      const restaurant = await RestaurantService.getById(restaurantId, userId);

      return {
        data: {
          restaurant: toRestaurant(restaurant),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get restaurant',
        },
      };
    }
  },

  /**
   * Update a restaurant
   */
  async update(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId, name, description, logoUrl, coverUrl, timezone, currency } =
      payload as RestaurantUpdatePayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_EDIT_SETTINGS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to edit this restaurant',
          },
        };
      }

      const restaurant = await RestaurantService.update(restaurantId, {
        name,
        description,
        logoUrl,
        coverImageUrl: coverUrl,
        timezone,
        currency,
      });

      return {
        data: {
          restaurant: toRestaurant(restaurant),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to update restaurant',
        },
      };
    }
  },

  /**
   * Delete a restaurant
   */
  async delete(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId } = payload as RestaurantDeletePayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_DELETE_RESTAURANT)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this restaurant',
          },
        };
      }

      await RestaurantService.delete(restaurantId);

      return {
        data: {
          message: 'Restaurant deleted successfully',
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to delete restaurant',
        },
      };
    }
  },
};
