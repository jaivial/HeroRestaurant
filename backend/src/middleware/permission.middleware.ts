import { Elysia } from 'elysia';
import { PermissionService } from '../services/permission.service';
import { hasPermission, USER_ACCESS_FLAGS } from '../constants/permissions';
import { Errors } from '../utils/errors';
import type { SessionContext } from './session.middleware';

interface PermissionRequirements {
  member?: bigint; // Global member flags required (deprecated name for user access flags)
  user?: bigint; // Global user access flags required (ROOT, REGULAR)
  restaurant?: bigint; // Restaurant-specific flags required
}

/**
 * Permission middleware factory for Elysia
 * Checks both global member flags and restaurant-specific permissions
 *
 * Usage:
 * ```typescript
 * new Elysia()
 *   .use(sessionMiddleware)
 *   .use(requirePermissions({ member: MEMBER_CREATE_RESTAURANT }))
 *   .post('/restaurants', handler)
 * ```
 */
export function requirePermissions(requirements: PermissionRequirements) {
  return new Elysia({ name: `permissions-${Date.now()}` })
    .onBeforeHandle(async (ctx) => {
      const { userId, globalFlags, currentRestaurantId } = ctx as unknown as SessionContext;
      const params = (ctx as unknown as { params?: { restaurantId?: string; id?: string } }).params;

      if (!userId) {
        throw Errors.UNAUTHORIZED;
      }

      // Check global user access flags if required (using both names for compatibility)
      const requiredUserFlags = requirements.user ?? requirements.member;
      if (requiredUserFlags !== undefined && globalFlags !== undefined) {
        if (!hasPermission(globalFlags, requiredUserFlags)) {
          throw Errors.PERMISSION_DENIED;
        }
      }

      // Check restaurant-specific flags if required
      if (requirements.restaurant !== undefined) {
        // Extract restaurant ID from params or context
        const restaurantId = params?.restaurantId || params?.id || currentRestaurantId;

        if (!restaurantId) {
          throw new Error('Restaurant ID not found in request');
        }

        // Verify user has required permissions for this restaurant
        await PermissionService.requirePermissions(userId, restaurantId, requirements.restaurant);
      }
    });
}

/**
 * Requires that the user is a member of the specified restaurant
 * Doesn't check specific permissions, just membership
 *
 * Usage:
 * ```typescript
 * new Elysia()
 *   .use(sessionMiddleware)
 *   .use(requireRestaurantMembership())
 *   .get('/restaurants/:id', handler)
 * ```
 */
export function requireRestaurantMembership() {
  return new Elysia({ name: `membership-${Date.now()}` })
    .onBeforeHandle(async (ctx) => {
      const { userId, currentRestaurantId } = ctx as unknown as SessionContext;
      const params = (ctx as unknown as { params?: { restaurantId?: string; id?: string } }).params;

      if (!userId) {
        throw Errors.UNAUTHORIZED;
      }

      // Extract restaurant ID from params or context
      const restaurantId = params?.restaurantId || params?.id || currentRestaurantId;

      if (!restaurantId) {
        throw new Error('Restaurant ID not found in request');
      }

      // Verify user is a member (throws if not found)
      await PermissionService.getMembership(userId, restaurantId);
    });
}
