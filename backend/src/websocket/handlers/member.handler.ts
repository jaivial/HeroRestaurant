import type { WSConnection } from '../state/connections';
import { MembershipService } from '../../services/membership.service';
import { MembershipRepository } from '../../repositories/membership.repository';
import { UserRepository } from '../../repositories/user.repository';
import { PermissionService } from '../../services/permission.service';
import { MEMBER_FLAGS } from '../../constants/permissions';
import { toMember } from '../../utils/transformers';
import type {
  MemberListPayload,
  MemberInvitePayload,
  MemberUpdatePayload,
  MemberRemovePayload,
} from '../../types/websocket.types';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const memberHandlers = {
  /**
   * List all members of a restaurant
   */
  async list(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId } = payload as MemberListPayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to view members',
          },
        };
      }

      const memberships = await MembershipService.listMembers(restaurantId);

      // Get user details for each membership
      const members = await Promise.all(
        memberships.map(async (m) => {
          const user = await UserRepository.findById(m.user_id);
          if (!user) return null;
          return toMember(m, user);
        })
      );

      return {
        data: {
          members: members.filter((m) => m !== null),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to list members',
        },
      };
    }
  },

  /**
   * Invite a member to a restaurant
   */
  async invite(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId, email, roleId } = payload as MemberInvitePayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_INVITE_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to invite members',
          },
        };
      }

      const newMembership = await MembershipService.inviteMember(restaurantId, { email, roleId }, userId);

      // Get user details
      const user = await UserRepository.findById(newMembership.user_id);
      if (!user) {
        return {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get invited user details',
          },
        };
      }

      return {
        data: {
          member: toMember(newMembership, user),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to invite member',
        },
      };
    }
  },

  /**
   * Update a member's details
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

    const { restaurantId, memberId, roleId, accessFlags, status } = payload as MemberUpdatePayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to manage members',
          },
        };
      }

      // Get the membership being updated
      const targetMembership = await MembershipRepository.findById(memberId);
      if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
        return {
          error: {
            code: 'NOT_FOUND',
            message: 'Member not found in this restaurant',
          },
        };
      }

      const updatedMembership = await MembershipService.updateMember(
        restaurantId,
        targetMembership.user_id,
        { roleId, accessFlags, status }
      );

      // Get user details
      const user = await UserRepository.findById(updatedMembership.user_id);
      if (!user) {
        return {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get member details',
          },
        };
      }

      return {
        data: {
          member: toMember(updatedMembership, user),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to update member',
        },
      };
    }
  },

  /**
   * Remove a member from a restaurant
   */
  async remove(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { restaurantId, memberId } = payload as MemberRemovePayload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_REMOVE_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to remove members',
          },
        };
      }

      // Get the membership being removed
      const targetMembership = await MembershipRepository.findById(memberId);
      if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
        return {
          error: {
            code: 'NOT_FOUND',
            message: 'Member not found in this restaurant',
          },
        };
      }

      await MembershipService.removeMember(restaurantId, targetMembership.user_id);

      return {
        data: {
          message: 'Member removed successfully',
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to remove member',
        },
      };
    }
  },
};
