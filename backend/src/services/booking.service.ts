import { BookingRepository } from '@/repositories/booking.repository';
import { TableRepository } from '@/repositories/table.repository';
import { GuestRepository } from '@/repositories/guest.repository';
import { WaitlistRepository } from '@/repositories/waitlist.repository';
import { Errors } from '@/utils/errors';
import type { Booking, NewBooking, BookingStatus, BookingSource } from '@/types/database.types';

interface CreateReservationInput {
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
  guestId?: string;
}

export class BookingService {
  static async getCalendarData(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, Booking[]>> {
    const bookings = await BookingRepository.findByDateRange(
      restaurantId,
      startDate,
      endDate
    );

    return bookings.reduce((acc, booking) => {
      if (!acc[booking.date]) {
        acc[booking.date] = [];
      }
      acc[booking.date].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);
  }

  static async getDashboardStats(
    restaurantId: string,
    date: string
  ): Promise<{
    totalBookings: number;
    pendingConfirmations: number;
    currentlySeated: number;
    upcomingReservations: number;
    waitlistCount: number;
    noShowsToday: number;
    cancelledToday: number;
  }> {
    const todayBookings = await BookingRepository.findByDate(restaurantId, date);

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const [
      waitlistCount,
      upcomingCount,
    ] = await Promise.all([
      WaitlistRepository.getWaitingCount(restaurantId),
      BookingRepository.countByStatus(restaurantId, date, 'pending'),
    ]);

    return {
      totalBookings: todayBookings.length,
      pendingConfirmations: upcomingCount,
      currentlySeated: todayBookings.filter((b) => b.status === 'seated').length,
      upcomingReservations: todayBookings.filter(
        (b) => b.status === 'confirmed' && b.start_time >= currentTime
      ).length,
      waitlistCount,
      noShowsToday: todayBookings.filter((b) => b.status === 'no_show').length,
      cancelledToday: todayBookings.filter((b) => b.status === 'cancelled').length,
    };
  }

  static async createReservation(
    restaurantId: string,
    data: CreateReservationInput,
    createdByUserId: string
  ): Promise<Booking> {
    const duration = data.duration ?? 90;
    const endTime = this.calculateEndTime(data.startTime, duration);

    if (!data.tableId) {
      const availableTables = await BookingRepository.findAvailableTables(
        restaurantId,
        data.date,
        data.startTime,
        endTime,
        data.partySize
      );

      if (availableTables.length === 0) {
        throw Errors.VALIDATION_ERROR({ message: 'No tables available for this time slot' });
      }
      data.tableId = availableTables[0];
    }

    if (data.tableId) {
      const table = await TableRepository.findById(data.tableId);
      if (!table) {
        throw Errors.NOT_FOUND('Table');
      }
      if (table.capacity < data.partySize) {
        throw Errors.VALIDATION_ERROR({ message: 'Table capacity insufficient for party size' });
      }

      const conflicts = await BookingRepository.findByTimeRange(
        restaurantId,
        data.date,
        data.startTime,
        endTime
      );

      if (conflicts.some((c) => c.table_id === data.tableId)) {
        throw Errors.CONFLICT('Table is already booked for this time slot');
      }
    }

    let guestId = data.guestId;
    if (!guestId) {
      const existingGuest = await GuestRepository.findByPhone(
        restaurantId,
        data.guestPhone
      );
      guestId = existingGuest?.id;
    }

    const bookingData: NewBooking = {
      restaurant_id: restaurantId,
      guest_id: guestId,
      table_id: data.tableId ?? null,
      guest_name: data.guestName,
      guest_email: data.guestEmail ?? null,
      guest_phone: data.guestPhone,
      party_size: data.partySize,
      date: data.date,
      start_time: data.startTime,
      end_time: endTime,
      duration_minutes: duration,
      status: 'pending',
      source: data.source,
      notes: data.notes ?? null,
      dietary_requirements: JSON.stringify(data.dietaryRequirements ?? []),
      created_by_user_id: createdByUserId,
    };

    return BookingRepository.create(bookingData);
  }

  static async updateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    updatedByUserId: string,
    reason?: string
  ): Promise<Booking> {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw Errors.NOT_FOUND('Booking');
    }

    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['seated', 'cancelled', 'no_show'],
      seated: ['completed'],
      completed: [],
      cancelled: [],
      no_show: [],
    };

    if (!validTransitions[booking.status].includes(newStatus)) {
      throw Errors.VALIDATION_ERROR({
        message: `Cannot transition from ${booking.status} to ${newStatus}`,
      });
    }

    const updateData: Partial<Booking> = {
      status: newStatus,
    };

    if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date();
      updateData.cancelled_by = 'staff';
      updateData.cancellation_reason = reason ?? null;

      if (booking.guest_id) {
        await GuestRepository.incrementCancellations(booking.guest_id);
      }
    }

    if (newStatus === 'no_show' && booking.guest_id) {
      await GuestRepository.incrementNoShows(booking.guest_id);
    }

    if (newStatus === 'completed' && booking.guest_id) {
      await GuestRepository.incrementVisits(booking.guest_id);
    }

    const updated = await BookingRepository.update(bookingId, updateData);
    if (!updated) {
      throw Errors.INTERNAL_ERROR;
    }

    return updated;
  }

  static async assignTable(
    bookingId: string,
    tableId: string
  ): Promise<Booking> {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw Errors.NOT_FOUND('Booking');
    }

    const table = await TableRepository.findById(tableId);
    if (!table) {
      throw Errors.NOT_FOUND('Table');
    }

    if (table.capacity < booking.party_size) {
      throw Errors.VALIDATION_ERROR({ message: 'Table capacity insufficient for party size' });
    }

    const conflicts = await BookingRepository.findByTimeRange(
      booking.restaurant_id,
      booking.date,
      booking.start_time,
      booking.end_time
    );

    if (conflicts.some((c) => c.table_id === tableId)) {
      throw Errors.CONFLICT('Table is already booked for this time slot');
    }

    const updated = await BookingRepository.assignTable(bookingId, tableId);
    if (!updated) {
      throw Errors.INTERNAL_ERROR;
    }

    return updated;
  }

  static async getAvailableTables(
    restaurantId: string,
    date: string,
    time: string,
    partySize: number
  ): Promise<string[]> {
    const endTime = this.calculateEndTime(time, 90);
    return BookingRepository.findAvailableTables(
      restaurantId,
      date,
      time,
      endTime,
      partySize
    );
  }

  static async searchGuests(
    restaurantId: string,
    query: string
  ): Promise<Array<{ id: string; name: string; phone: string; email?: string }>> {
    const guests = await GuestRepository.search(restaurantId, query);
    return guests.map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phone,
      email: g.email ?? undefined,
    }));
  }

  static async addToWaitlist(
    restaurantId: string,
    data: {
      guestName: string;
      guestPhone: string;
      guestEmail?: string;
      partySize: number;
      notes?: string;
    }
  ) {
    return WaitlistRepository.add({
      restaurant_id: restaurantId,
      guest_name: data.guestName,
      guest_phone: data.guestPhone,
      guest_email: data.guestEmail ?? null,
      party_size: data.partySize,
      notes: data.notes ?? null,
      quoted_wait_minutes: null,
    });
  }

  static async getWaitlist(restaurantId: string) {
    return WaitlistRepository.findByRestaurant(restaurantId);
  }

  private static calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
}
