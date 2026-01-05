import { db } from '@/database/kysely';
import type { WaitlistEntry, NewWaitlistEntry, WaitlistEntryUpdate, WaitlistStatus, WaitlistEntryInput } from '@/types/database.types';

export class WaitlistRepository {
  static async findById(id: string): Promise<WaitlistEntry | undefined> {
    const result = await db
      .selectFrom('waitlist')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as WaitlistEntry | undefined;
  }

  static async findByRestaurant(restaurantId: string): Promise<WaitlistEntry[]> {
    return db
      .selectFrom('waitlist')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('status', '=', 'waiting')
      .where('deleted_at', 'is', null)
      .orderBy('position')
      .execute() as Promise<WaitlistEntry[]>;
  }

  static async getNextPosition(restaurantId: string): Promise<number> {
    const result = await db
      .selectFrom('waitlist')
      .select((eb) => eb.fn.max<number>('position').as('maxPosition'))
      .where('restaurant_id', '=', restaurantId)
      .executeTakeFirst();

    return (result?.maxPosition ?? 0) + 1;
  }

  static async add(data: WaitlistEntryInput): Promise<WaitlistEntry> {
    const position = await this.getNextPosition(data.restaurant_id);

    const result = await db
      .insertInto('waitlist')
      .values({
        ...data,
        position,
        status: 'waiting' as WaitlistStatus,
      })
      .returningAll()
      .executeTakeFirst();
    return result as WaitlistEntry;
  }

  static async update(
    id: string,
    data: WaitlistEntryUpdate
  ): Promise<WaitlistEntry | undefined> {
    const result = await db
      .updateTable('waitlist')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as WaitlistEntry | undefined;
  }

  static async updateStatus(
    id: string,
    status: WaitlistStatus
  ): Promise<WaitlistEntry | undefined> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date(),
    };

    if (status === 'notified') {
      updateData.notified_at = new Date();
    }

    if (status === 'seated') {
      updateData.seated_at = new Date();
    }

    const result = await db
      .updateTable('waitlist')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as WaitlistEntry | undefined;
  }

  static async remove(id: string): Promise<void> {
    await db
      .updateTable('waitlist')
      .set({
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async seatFromWaitlist(
    id: string,
    tableId: string,
    createdByUserId: string
  ): Promise<void> {
    await db.transaction().execute(async (trx) => {
      const entry = await trx
        .selectFrom('waitlist')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!entry) {
        throw new Error('Waitlist entry not found');
      }

      await trx
        .insertInto('bookings')
        .values({
          restaurant_id: entry.restaurant_id,
          guest_name: entry.guest_name,
          guest_phone: entry.guest_phone,
          guest_email: entry.guest_email,
          party_size: entry.party_size,
          date: new Date().toISOString().split('T')[0],
          start_time: new Date().toTimeString().slice(0, 5),
          end_time: this.calculateEndTime(new Date().toTimeString().slice(0, 5), 90),
          duration_minutes: 90,
          status: 'seated',
          source: 'walk_in',
          table_id: tableId,
          notes: entry.notes,
          dietary_requirements: '[]',
          created_by_user_id: createdByUserId,
        })
        .execute();

      await trx
        .updateTable('waitlist')
        .set({
          status: 'seated' as WaitlistStatus,
          seated_at: new Date(),
          updated_at: new Date(),
        })
        .where('id', '=', id)
        .execute();
    });
  }

  static async getWaitingCount(restaurantId: string): Promise<number> {
    const result = await db
      .selectFrom('waitlist')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .where('restaurant_id', '=', restaurantId)
      .where('status', '=', 'waiting')
      .executeTakeFirst();

    return result?.count ?? 0;
  }

  private static calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
}
