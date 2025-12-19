import { db } from '../database/kysely';
import type { Restaurant, NewRestaurant, RestaurantUpdate } from '../types/database.types';

export class RestaurantRepository {
  static async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await db
      .selectFrom('restaurants')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return restaurant ?? null;
  }

  static async findBySlug(slug: string): Promise<Restaurant | null> {
    const restaurant = await db
      .selectFrom('restaurants')
      .selectAll()
      .where('slug', '=', slug)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return restaurant ?? null;
  }

  static async findByOwnerId(ownerId: string): Promise<Restaurant[]> {
    return await db
      .selectFrom('restaurants')
      .selectAll()
      .where('owner_user_id', '=', ownerId)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async create(data: NewRestaurant): Promise<Restaurant> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('restaurants')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const restaurant = await this.findById(id);
    if (!restaurant) {
      throw new Error('Failed to create restaurant');
    }

    return restaurant;
  }

  static async update(id: string, data: RestaurantUpdate): Promise<Restaurant> {
    await db
      .updateTable('restaurants')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const restaurant = await this.findById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found after update');
    }

    return restaurant;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('restaurants')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  static async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = db
      .selectFrom('restaurants')
      .select('id')
      .where('slug', '=', slug)
      .where('deleted_at', 'is', null);

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const result = await query.executeTakeFirst();
    return result !== undefined;
  }
}
