import { BookingService } from '../../services/booking.service';
import { BookingRepository } from '../../repositories/booking.repository';
import { TableRepository } from '../../repositories/table.repository';
import { GuestRepository } from '../../repositories/guest.repository';
import { WaitlistRepository } from '../../repositories/waitlist.repository';
import type { WSConnection } from '../state/connections';
import { MEMBER_FLAGS } from '../../constants/permissions';
import { PermissionService } from '../../services/permission.service';

const parseBookingFromDB = (booking: any) => ({
  ...booking,
  guestId: booking.guest_id,
  tableId: booking.table_id,
  tableGroupId: booking.table_group_id,
  guestEmail: booking.guest_email,
  guestPhone: booking.guest_phone,
  partySize: booking.party_size,
  startTime: booking.start_time,
  endTime: booking.end_time,
  durationMinutes: booking.duration_minutes,
  dietaryRequirements: typeof booking.dietary_requirements === 'string'
    ? JSON.parse(booking.dietary_requirements)
    : (booking.dietary_requirements || []),
  confirmationSentAt: booking.confirmation_sent_at,
  reminderSentAt: booking.reminder_sent_at,
  cancelledAt: booking.cancelled_at,
  cancelledBy: booking.cancelled_by,
  cancellationReason: booking.cancellation_reason,
  createdByUserId: booking.created_by_user_id,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at,
});

const parseTableFromDB = (table: any) => ({
  ...table,
  positionX: table.position_x,
  positionY: table.position_y,
  minCapacity: table.min_capacity,
  isActive: !!table.is_active,
});

export const bookingHandlers = {
  async list(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      const { startDate, endDate } = payload;
      if (!startDate || !endDate) {
        return { error: { code: 'VALIDATION_ERROR', message: 'startDate and endDate are required' } };
      }

      const data = await BookingService.getCalendarData(
        payload.restaurantId,
        startDate,
        endDate
      );

      return {
        data: Object.fromEntries(
          Object.entries(data).map(([date, bookings]) => [date, bookings.map(parseBookingFromDB)])
        ),
      };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async get(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const booking = await BookingRepository.findById(payload.bookingId);
      if (!booking) {
        return { error: { code: 'NOT_FOUND', message: 'Booking not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        booking.restaurant_id,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      return { data: parseBookingFromDB(booking) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async create(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
      );

      const booking = await BookingService.createReservation(
        payload.restaurantId,
        {
          guestName: payload.guestName,
          guestPhone: payload.guestPhone,
          guestEmail: payload.guestEmail,
          partySize: payload.partySize,
          date: payload.date,
          startTime: payload.startTime,
          duration: payload.duration,
          tableId: payload.tableId,
          source: payload.source,
          notes: payload.notes,
          dietaryRequirements: payload.dietaryRequirements,
          guestId: payload.guestId,
        },
        userId
      );

      return { data: parseBookingFromDB(booking) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateStatus(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const booking = await BookingRepository.findById(payload.bookingId);
      if (!booking) {
        return { error: { code: 'NOT_FOUND', message: 'Booking not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        booking.restaurant_id,
        MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
      );

      const updated = await BookingService.updateStatus(
        payload.bookingId,
        payload.status,
        userId,
        payload.reason
      );

      return { data: parseBookingFromDB(updated) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async assignTable(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const booking = await BookingRepository.findById(payload.bookingId);
      if (!booking) {
        return { error: { code: 'NOT_FOUND', message: 'Booking not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        booking.restaurant_id,
        MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
      );

      const table = await TableRepository.findById(payload.tableId);
      if (!table) {
        return { error: { code: 'NOT_FOUND', message: 'Table not found' } };
      }

      const updated = await BookingService.assignTable(
        payload.bookingId,
        payload.tableId
      );

      return { data: parseBookingFromDB(updated) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async getAvailableTables(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      const tableIds = await BookingService.getAvailableTables(
        payload.restaurantId,
        payload.date,
        payload.time,
        payload.partySize
      );

      const tables = await Promise.all(
        tableIds.map((id) => TableRepository.findById(id))
      );

      return { data: tables.filter(Boolean).map(parseTableFromDB) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async searchGuests(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      if (!payload.query || payload.query.length < 2) {
        return { data: [] };
      }

      const guests = await BookingService.searchGuests(
        payload.restaurantId,
        payload.query
      );

      return { data: guests };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async getStats(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      const date = payload.date ?? new Date().toISOString().split('T')[0];
      const stats = await BookingService.getDashboardStats(payload.restaurantId, date);

      return { data: stats };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async getWaitlist(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_RESERVATIONS
      );

      const waitlist = await BookingService.getWaitlist(payload.restaurantId);
      return { data: waitlist };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async addToWaitlist(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
      );

      const entry = await BookingService.addToWaitlist(payload.restaurantId, {
        guestName: payload.guestName,
        guestPhone: payload.guestPhone,
        guestEmail: payload.guestEmail,
        partySize: payload.partySize,
        notes: payload.notes,
      });

      return { data: entry };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async seatFromWaitlist(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const entry = await WaitlistRepository.findById(payload.waitlistId);
      if (!entry) {
        return { error: { code: 'NOT_FOUND', message: 'Waitlist entry not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        entry.restaurant_id,
        MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS
      );

      await WaitlistRepository.seatFromWaitlist(
        payload.waitlistId,
        payload.tableId,
        userId
      );

      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },
};
