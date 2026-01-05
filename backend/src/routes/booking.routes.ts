import { Elysia, t } from 'elysia';
import type { BookingSource } from '@/types/database.types';
import { BookingService } from '../services/booking.service';
import { BookingRepository } from '../repositories/booking.repository';
import { TableRepository } from '../repositories/table.repository';
import { hasFlag, MEMBER_FLAGS } from '../constants/permissions';
import { SessionService } from '../services/session.service';
import { MembershipService } from '../services/membership.service';
import { Errors } from '../utils/errors';

const parseBookingFromDB = (booking: Record<string, unknown>) => ({
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
    ? JSON.parse(booking.dietary_requirements as string)
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

const parseTableFromDB = (table: Record<string, unknown> | undefined) => {
  if (!table) return null;
  return {
    ...table,
    positionX: table.position_x,
    positionY: table.position_y,
    minCapacity: table.min_capacity,
    isActive: !!table.is_active,
  };
};

const canViewReservations = (flags: bigint) => hasFlag(flags, MEMBER_FLAGS.CAN_VIEW_RESERVATIONS);
const canManageReservations = (flags: bigint) => hasFlag(flags, MEMBER_FLAGS.CAN_MANAGE_RESERVATIONS);

interface BookingContext {
  restaurantId: string;
  userId: string;
  canView: boolean;
  canManage: boolean;
}

export const bookingRoutes = new Elysia({ prefix: '/api/bookings' })
  // Global error handler
  .onError(({ error, set }) => {
    console.error('Booking route error:', error);

    if ('code' in error && 'statusCode' in error) {
      const knownError = error as { code: string; message: string; statusCode: number };
      set.status = knownError.statusCode;
      return {
        success: false,
        error: {
          code: knownError.code,
          message: knownError.message,
        },
      };
    }

    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  })
  .derive(async ({ request, headers }) => {
    const authHeader = headers.authorization;
    let sessionId: string | undefined;

    if (authHeader?.startsWith('Session ')) {
      sessionId = authHeader.split(' ')[1];
    }

    if (!sessionId) {
      return { restaurantId: '', userId: '', canView: false, canManage: false };
    }

    try {
      const { session, user } = await SessionService.validate(sessionId);
      if (!session || !user) {
        return { restaurantId: '', userId: '', canView: false, canManage: false };
      }

      const restaurantId = session.current_restaurant_id;
      if (!restaurantId) {
        return { restaurantId: '', userId: '', canView: false, canManage: false };
      }

      const membership = await MembershipService.getMembership(user.id, restaurantId);
      const flags = membership?.access_flags ?? 0n;

      return {
        restaurantId,
        userId: user.id,
        canView: canViewReservations(flags),
        canManage: canManageReservations(flags),
      };
    } catch {
      return { restaurantId: '', userId: '', canView: false, canManage: false };
    }
  })
  .get('/', async ({ query, restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const { startDate, endDate } = query;

    if (!startDate || !endDate) {
      throw Errors.VALIDATION_ERROR({ message: 'startDate and endDate are required' });
    }

    const data = await BookingService.getCalendarData(restaurantId, startDate, endDate);

    return {
      success: true,
      data: Object.fromEntries(
        Object.entries(data).map(([date, bookings]) => [date, bookings.map(parseBookingFromDB)])
      ),
    };
  })
  .get('/stats', async ({ query, restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const date = query.date ?? new Date().toISOString().split('T')[0];
    const stats = await BookingService.getDashboardStats(restaurantId, date);

    return { success: true, data: stats };
  })
  .get('/available-tables', async ({ query, restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const { date, time, partySize } = query;

    if (!date || !time || !partySize) {
      throw Errors.VALIDATION_ERROR({ message: 'date, time, and partySize are required' });
    }

    const tableIds = await BookingService.getAvailableTables(
      restaurantId,
      date,
      time,
      parseInt(partySize)
    );

    const tables = await Promise.all(
      tableIds.map((id) => TableRepository.findById(id))
    );

    return {
      success: true,
      data: tables.filter(Boolean).map((t) => parseTableFromDB(t)).filter(Boolean),
    };
  })
  .get('/guests/search', async ({ query, restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const { q } = query;

    if (!q || q.length < 2) {
      return { success: true, data: [] };
    }

    const guests = await BookingService.searchGuests(restaurantId, q);
    return { success: true, data: guests };
  })
  .get('/waitlist', async ({ restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const waitlist = await BookingService.getWaitlist(restaurantId);
    return { success: true, data: waitlist };
  })
  .get('/:id', async ({ params, restaurantId, canView }) => {
    if (!restaurantId || !canView) {
      throw Errors.FORBIDDEN;
    }

    const booking = await BookingRepository.findById(params.id);
    if (!booking) {
      throw Errors.NOT_FOUND('Booking');
    }

    return { success: true, data: parseBookingFromDB(booking) };
  })
  .post('/', async ({ body, restaurantId, userId, canManage }) => {
    if (!restaurantId || !canManage) {
      throw Errors.FORBIDDEN;
    }

    const data = body as {
      guestName: string;
      guestPhone: string;
      guestEmail?: string;
      partySize: number;
      date: string;
      startTime: string;
      duration?: number;
      tableId?: string;
      source: BookingSource;
      notes?: string;
      dietaryRequirements?: string[];
    };

    try {
      const booking = await BookingService.createReservation(
        restaurantId,
        data,
        userId
      );

      return { success: true, data: parseBookingFromDB(booking) };
    } catch (e) {
      throw Errors.VALIDATION_ERROR({
        message: e instanceof Error ? e.message : 'Failed to create booking',
      });
    }
  })
  .patch('/:id/status', async ({ params, body, restaurantId, userId, canManage }) => {
    if (!restaurantId || !canManage) {
      throw Errors.FORBIDDEN;
    }

    const data = body as { status: string; reason?: string };

    try {
      const booking = await BookingService.updateStatus(
        params.id,
        data.status as 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show',
        userId,
        data.reason
      );

      return { success: true, data: parseBookingFromDB(booking) };
    } catch (e) {
      throw Errors.VALIDATION_ERROR({
        message: e instanceof Error ? e.message : 'Failed to update status',
      });
    }
  })
  .put('/:id/table', async ({ params, body, restaurantId, canManage }) => {
    if (!restaurantId || !canManage) {
      throw Errors.FORBIDDEN;
    }

    const data = body as { tableId: string };

    try {
      const booking = await BookingService.assignTable(
        params.id,
        data.tableId
      );

      return { success: true, data: parseBookingFromDB(booking) };
    } catch (e) {
      throw Errors.VALIDATION_ERROR({
        message: e instanceof Error ? e.message : 'Failed to assign table',
      });
    }
  })
  .post('/waitlist', async ({ body, restaurantId, canManage }) => {
    if (!restaurantId || !canManage) {
      throw Errors.FORBIDDEN;
    }

    const data = body as {
      guestName: string;
      guestPhone: string;
      guestEmail?: string;
      partySize: number;
      notes?: string;
    };

    try {
      const entry = await BookingService.addToWaitlist(restaurantId, data);
      return { success: true, data: entry };
    } catch (e) {
      throw Errors.VALIDATION_ERROR({
        message: e instanceof Error ? e.message : 'Failed to add to waitlist',
      });
    }
  });
