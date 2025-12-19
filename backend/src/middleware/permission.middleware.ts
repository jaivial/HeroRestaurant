import type { Context, Next } from 'hono';
import { PermissionService } from '../services/permission.service';
import { hasPermission } from '../constants/permissions';
import { Errors } from '../utils/errors';

interface PermissionRequirements {
  member?: bigint; // Global member flags required
  restaurant?: bigint; // Restaurant-specific flags required
}

/**
 * Permission middleware factory
 * Checks both global member flags and restaurant-specific permissions
 */
export function requirePermissions(requirements: PermissionRequirements) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId') as string | undefined;
    const memberFlags = c.get('memberFlags') as bigint | undefined;

    if (!userId) {
      throw Errors.UNAUTHORIZED;
    }

    // Check global member flags if required
    if (requirements.member !== undefined && memberFlags !== undefined) {
      if (!hasPermission(memberFlags, requirements.member)) {
        throw Errors.PERMISSION_DENIED;
      }
    }

    // Check restaurant-specific flags if required
    if (requirements.restaurant !== undefined) {
      // Extract restaurant ID from params or body
      const restaurantId =
        c.req.param('restaurantId') ||
        c.req.param('id') ||
        c.get('currentRestaurantId');

      if (!restaurantId) {
        throw new Error('Restaurant ID not found in request');
      }

      // Get membership and check permissions
      await PermissionService.requirePermissions(userId, restaurantId, requirements.restaurant);

      // Store membership in context for handler use
      const membership = await PermissionService.getMembership(userId, restaurantId);
      c.set('membership', membership);
      c.set('restaurantFlags', membership.access_flags);
    }

    await next();
  };
}

/**
 * Requires that the user is a member of the specified restaurant
 * Doesn't check specific permissions, just membership
 */
export function requireRestaurantMembership() {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId') as string | undefined;

    if (!userId) {
      throw Errors.UNAUTHORIZED;
    }

    const restaurantId =
      c.req.param('restaurantId') ||
      c.req.param('id') ||
      c.get('currentRestaurantId');

    if (!restaurantId) {
      throw new Error('Restaurant ID not found in request');
    }

    // Get membership (throws if not found)
    const membership = await PermissionService.getMembership(userId, restaurantId);
    c.set('membership', membership);
    c.set('restaurantFlags', membership.access_flags);

    await next();
  };
}
