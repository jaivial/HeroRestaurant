import type { WSConnection } from '../state/connections';
import { RoleService } from '../../services/role.service';
import { MembershipService } from '../../services/membership.service';
import { PermissionService } from '../../services/permission.service';
import { MEMBER_FLAGS } from '../../constants/permissions';
import type {
  RoleListPayload,
  RoleCreatePayload,
  RoleUpdatePayload,
  RoleDeletePayload,
} from '../../types/websocket.types';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const roleHandlers = {
  /**
   * List all roles for a restaurant
   */
  async list(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId } = payload as RoleListPayload;

    try {
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_MEMBERS)) {
        return { error: { code: 'FORBIDDEN', message: 'You do not have permission to view roles' } };
      }

      const roles = await RoleService.listRoles(restaurantId);

      return {
        data: {
          roles: roles.map(r => ({
            ...r,
            permissions: r.permissions.toString()
          })),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to list roles',
        },
      };
    }
  },

  /**
   * Create a new role
   */
  async create(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, name, description, permissions, displayOrder, color } = payload as RoleCreatePayload;

    try {
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_ROLES)) {
        return { error: { code: 'FORBIDDEN', message: 'You do not have permission to manage roles' } };
      }

      const role = await RoleService.createRole(
        restaurantId,
        {
          name,
          description: description || null,
          permissions: BigInt(permissions),
          display_order: displayOrder,
          color: color || null,
        },
        userId
      );

      return {
        data: {
          role: {
            ...role,
            permissions: role.permissions.toString()
          },
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to create role',
        },
      };
    }
  },

  /**
   * Update an existing role
   */
  async update(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, roleId, name, description, permissions, displayOrder, color } = payload as RoleUpdatePayload;

    try {
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_ROLES)) {
        return { error: { code: 'FORBIDDEN', message: 'You do not have permission to manage roles' } };
      }

      const role = await RoleService.updateRole(
        restaurantId,
        roleId,
        {
          name,
          description: description || undefined,
          permissions: permissions ? BigInt(permissions) : undefined,
          display_order: displayOrder,
          color: color || undefined,
        },
        userId
      );

      return {
        data: {
          role: {
            ...role,
            permissions: role.permissions.toString()
          },
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to update role',
        },
      };
    }
  },

  /**
   * Delete a role
   */
  async delete(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, roleId } = payload as RoleDeletePayload;

    try {
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_ROLES)) {
        return { error: { code: 'FORBIDDEN', message: 'You do not have permission to manage roles' } };
      }

      await RoleService.deleteRole(restaurantId, roleId, userId);

      return {
        data: {
          message: 'Role deleted successfully',
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to delete role',
        },
      };
    }
  },
};

