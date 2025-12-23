import type { WSConnection } from '../state/connections';
import { ShiftService } from '../../services/shift.service';
import { ScheduledShiftService } from '../../services/scheduled-shift.service';
import { PermissionService } from '../../services/permission.service';
import { MembershipService } from '../../services/membership.service';
import { MembershipRepository } from '../../repositories/membership.repository';
import { MEMBER_FLAGS } from '../../constants/permissions';
import { createEvent } from '../../types/websocket.types';
import { connectionManager } from '../state/connections';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const shiftHandlers = {
  /**
   * Punch in/out
   */
  async punch(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, action, notes } = payload;

    try {
      const shift = action === 'in' 
        ? await ShiftService.punchIn(userId, restaurantId)
        : await ShiftService.punchOut(userId, restaurantId, notes);

      // Broadcast update to the restaurant
      const event = createEvent('shift', 'status_updated', {
        memberId: userId,
        status: action,
        timestamp: new Date().toISOString(),
      }, { restaurantId });

      connectionManager.broadcastToRestaurant(restaurantId, event);

      return { data: { shift } };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to punch',
        },
      };
    }
  },

  /**
   * Get current status
   */
  async getStatus(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId } = payload;

    try {
      const status = await ShiftService.getCurrentStatus(userId, restaurantId);
      return { data: status };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get status',
        },
      };
    }
  },

  /**
   * Get personal stats
   */
  async getPersonalStats(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, period, memberId, offset } = payload;

    try {
      let targetUserId = userId;

      // If memberId is provided, check if requester is admin
      if (memberId && memberId !== userId) {
        const membership = await MembershipService.getMembership(userId, restaurantId);
        if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_MEMBERS)) {
          return {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to view other members stats',
            },
          };
        }
        // memberId in the payload is the membershipId, resolve it to userId
        const targetMembership = await MembershipRepository.findById(memberId);
        if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
          return {
            error: {
              code: 'NOT_FOUND',
              message: 'Member not found in this restaurant',
            },
          };
        }
        targetUserId = targetMembership.user_id;
      }

      const stats = await ShiftService.getPersonalStats(targetUserId, restaurantId, period, offset);
      return { data: stats };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get personal stats',
        },
      };
    }
  },

  /**
   * Get team stats (Admin only)
   */
  async getTeamStats(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, period } = payload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to view team shift stats',
          },
        };
      }

      const stats = await ShiftService.getTeamStats(restaurantId, period || 'weekly');
      return { data: { members: stats } };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get team stats',
        },
      };
    }
  },

  /**
   * Get scheduled shifts
   */
  async getScheduledShifts(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, startDate, endDate } = payload;

    try {
      const shifts = await ScheduledShiftService.getShifts(
        restaurantId, 
        new Date(startDate), 
        new Date(endDate)
      );
      return { data: { shifts } };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get scheduled shifts',
        },
      };
    }
  },

  /**
   * Assign a shift (Admin only)
   */
  async assignShift(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, shiftData } = payload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to assign shifts',
          },
        };
      }

      const shift = await ScheduledShiftService.createShift(userId, restaurantId, {
        ...shiftData,
        start_at: new Date(shiftData.start_at),
        end_at: new Date(shiftData.end_at),
      });

      // Broadcast update
      const event = createEvent('shift', 'scheduled_updated', {
        shiftId: shift.id,
        action: 'created',
      }, { restaurantId });

      connectionManager.broadcastToRestaurant(restaurantId, event);

      return { data: { shift } };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to assign shift',
        },
      };
    }
  },

  /**
   * Remove a scheduled shift (Admin only)
   */
  async removeScheduledShift(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    if (!userId) return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Not authenticated' } };

    const { restaurantId, shiftId } = payload;

    try {
      // Check permission
      const membership = await MembershipService.getMembership(userId, restaurantId);
      if (!membership || !PermissionService.hasMemberPermission(membership.access_flags, MEMBER_FLAGS.CAN_MANAGE_MEMBERS)) {
        return {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to remove scheduled shifts',
          },
        };
      }

      await ScheduledShiftService.deleteShift(userId, restaurantId, shiftId);

      // Broadcast update
      const event = createEvent('shift', 'scheduled_updated', {
        shiftId,
        action: 'deleted',
      }, { restaurantId });

      connectionManager.broadcastToRestaurant(restaurantId, event);

      return { data: { success: true } };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to remove scheduled shift',
        },
      };
    }
  },
};

