import { db } from '@/database/kysely';
import type { Guest, NewGuest, GuestUpdate } from '@/types/database.types';

export class GuestRepository {
  static async findById(id: string): Promise<Guest | undefined> {
    const result = await db
      .selectFrom('guests')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async findByPhone(
    restaurantId: string,
    phone: string
  ): Promise<Guest | undefined> {
    const result = await db
      .selectFrom('guests')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('phone', '=', phone)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async findByEmail(
    restaurantId: string,
    email: string
  ): Promise<Guest | undefined> {
    const result = await db
      .selectFrom('guests')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async search(
    restaurantId: string,
    query: string
  ): Promise<Guest[]> {
    return db
      .selectFrom('guests')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('deleted_at', 'is', null)
      .where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${query}%`),
          eb('phone', 'ilike', `%${query}%`),
          eb('email', 'ilike', `%${query}%`),
        ])
      )
      .limit(20)
      .execute() as Promise<Guest[]>;
  }

  static async findOrCreate(
    restaurantId: string,
    data: {
      name: string;
      phone: string;
      email?: string;
    }
  ): Promise<Guest> {
    const existing = await this.findByPhone(restaurantId, data.phone);
    if (existing) {
      return existing;
    }

    return this.create({
      restaurant_id: restaurantId,
      name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      notes: null,
      total_visits: 0,
      total_no_shows: 0,
      total_cancellations: 0,
      last_visit_at: null,
      preferences: '[]',
      tags: '[]',
      blocked: false,
      blocked_reason: null,
    });
  }

  static async create(data: NewGuest): Promise<Guest> {
    const result = await db
      .insertInto('guests')
      .values(data)
      .returningAll()
      .executeTakeFirst();
    return result as Guest;
  }

  static async update(
    id: string,
    data: GuestUpdate
  ): Promise<Guest | undefined> {
    const result = await db
      .updateTable('guests')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async incrementVisits(id: string): Promise<void> {
    await db
      .updateTable('guests')
      .set({
        total_visits: (eb) => eb('total_visits', '+', 1),
        last_visit_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async incrementNoShows(id: string): Promise<void> {
    await db
      .updateTable('guests')
      .set({
        total_no_shows: (eb) => eb('total_no_shows', '+', 1),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async incrementCancellations(id: string): Promise<void> {
    await db
      .updateTable('guests')
      .set({
        total_cancellations: (eb) => eb('total_cancellations', '+', 1),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('guests')
      .set({
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async block(
    id: string,
    reason: string
  ): Promise<Guest | undefined> {
    const result = await db
      .updateTable('guests')
      .set({
        blocked: true,
        blocked_reason: reason,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async unblock(id: string): Promise<Guest | undefined> {
    const result = await db
      .updateTable('guests')
      .set({
        blocked: false,
        blocked_reason: null,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Guest | undefined;
  }

  static async getFrequentGuests(
    restaurantId: string,
    limit = 10
  ): Promise<Guest[]> {
    return db
      .selectFrom('guests')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('blocked', '=', false)
      .where('deleted_at', 'is', null)
      .orderBy('total_visits', 'desc')
      .limit(limit)
      .execute() as Promise<Guest[]>;
  }
}
