import { db } from '@/database/kysely';
import type { Booking, NewBooking, BookingUpdate, BookingStatus } from '@/types/database.types';

export class BookingRepository {
  static async findById(id: string): Promise<Booking | undefined> {
    const result = await db
      .selectFrom('bookings')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as Booking | undefined;
  }

  static async findByDate(
    restaurantId: string,
    date: string
  ): Promise<Booking[]> {
    return db
      .selectFrom('bookings')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('date', '=', date)
      .where('deleted_at', 'is', null)
      .orderBy('start_time')
      .execute() as Promise<Booking[]>;
  }

  static async findByDateRange(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<Booking[]> {
    return db
      .selectFrom('bookings')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .where('deleted_at', 'is', null)
      .orderBy('date')
      .orderBy('start_time')
      .execute() as Promise<Booking[]>;
  }

  static async findByTimeRange(
    restaurantId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Booking[]> {
    return db
      .selectFrom('bookings')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('date', '=', date)
      .where('deleted_at', 'is', null)
      .where('status', 'not in', ['cancelled', 'no_show'])
      .where((eb) =>
        eb.or([
          eb('start_time', '>=', startTime).and('start_time', '<', endTime),
          eb('end_time', '>', startTime).and('end_time', '<=', endTime),
          eb('start_time', '<=', startTime).and('end_time', '>=', endTime),
        ])
      )
      .execute() as Promise<Booking[]>;
  }

  static async findAvailableTables(
    restaurantId: string,
    date: string,
    startTime: string,
    endTime: string,
    partySize: number
  ): Promise<string[]> {
    const tables = await db
      .selectFrom('tables')
      .select('id')
      .where('restaurant_id', '=', restaurantId)
      .where('is_active', '=', true)
      .where('capacity', '>=', partySize)
      .execute();

    const bookedTables = await db
      .selectFrom('bookings')
      .select('table_id')
      .where('restaurant_id', '=', restaurantId)
      .where('date', '=', date)
      .where('deleted_at', 'is', null)
      .where('status', 'not in', ['cancelled', 'no_show'])
      .where('table_id', 'is not', null)
      .where((eb) =>
        eb.or([
          eb('start_time', '>=', startTime).and('start_time', '<', endTime),
          eb('end_time', '>', startTime).and('end_time', '<=', endTime),
          eb('start_time', '<=', startTime).and('end_time', '>=', endTime),
        ])
      )
      .execute();

    const bookedIds = new Set(bookedTables.map((t) => t.table_id).filter(Boolean));
    return tables.filter((t) => !bookedIds.has(t.id)).map((t) => t.id);
  }

  static async create(data: NewBooking): Promise<Booking> {
    const result = await db
      .insertInto('bookings')
      .values(data)
      .returningAll()
      .executeTakeFirst();
    return result as Booking;
  }

  static async update(
    id: string,
    data: BookingUpdate
  ): Promise<Booking | undefined> {
    const result = await db
      .updateTable('bookings')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Booking | undefined;
  }

  static async updateStatus(
    id: string,
    status: BookingStatus,
    additionalData?: Partial<BookingUpdate>
  ): Promise<Booking | undefined> {
    const updateData: Record<string, unknown> = {
      ...additionalData,
      status,
      updated_at: new Date(),
    };

    if (status === 'cancelled') {
      updateData.cancelled_at = new Date();
    }

    const result = await db
      .updateTable('bookings')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Booking | undefined;
  }

  static async assignTable(
    bookingId: string,
    tableId: string
  ): Promise<Booking | undefined> {
    const result = await db
      .updateTable('bookings')
      .set({
        table_id: tableId,
        updated_at: new Date(),
      })
      .where('id', '=', bookingId)
      .returningAll()
      .executeTakeFirst();
    return result as Booking | undefined;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('bookings')
      .set({
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async countByStatus(
    restaurantId: string,
    date: string,
    status: BookingStatus
  ): Promise<number> {
    const result = await db
      .selectFrom('bookings')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .where('restaurant_id', '=', restaurantId)
      .where('date', '=', date)
      .where('status', '=', status)
      .executeTakeFirst();
    return result?.count ?? 0;
  }

  static async getGuestBookings(
    guestId: string,
    limit = 10
  ): Promise<Booking[]> {
    return db
      .selectFrom('bookings')
      .selectAll()
      .where('guest_id', '=', guestId)
      .where('deleted_at', 'is', null)
      .orderBy('date', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute() as Promise<Booking[]>;
  }
}
