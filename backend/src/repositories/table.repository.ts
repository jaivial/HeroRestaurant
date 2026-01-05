import { db } from '@/database/kysely';
import type { Table, NewTable, TableUpdate } from '@/types/database.types';

export class TableRepository {
  static async findById(id: string): Promise<Table | undefined> {
    const result = await db
      .selectFrom('tables')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result as Table | undefined;
  }

  static async findByRestaurant(restaurantId: string): Promise<Table[]> {
    return db
      .selectFrom('tables')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('is_active', '=', true)
      .where('deleted_at', 'is', null)
      .orderBy('section')
      .orderBy('name')
      .execute() as Promise<Table[]>;
  }

  static async findBySection(
    restaurantId: string,
    section: string
  ): Promise<Table[]> {
    return db
      .selectFrom('tables')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('section', '=', section)
      .where('is_active', '=', true)
      .where('deleted_at', 'is', null)
      .execute() as Promise<Table[]>;
  }

  static async findByCapacity(
    restaurantId: string,
    minCapacity: number,
    maxCapacity?: number
  ): Promise<Table[]> {
    let query = db
      .selectFrom('tables')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('capacity', '>=', minCapacity)
      .where('is_active', '=', true)
      .where('deleted_at', 'is', null);

    if (maxCapacity) {
      query = query.where('capacity', '<=', maxCapacity);
    }

    return query.execute() as Promise<Table[]>;
  }

  static async create(data: NewTable): Promise<Table> {
    const result = await db
      .insertInto('tables')
      .values(data)
      .returningAll()
      .executeTakeFirst();
    return result as Table;
  }

  static async update(
    id: string,
    data: TableUpdate
  ): Promise<Table | undefined> {
    const result = await db
      .updateTable('tables')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result as Table | undefined;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('tables')
      .set({
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async getSections(restaurantId: string): Promise<string[]> {
    const result = await db
      .selectFrom('tables')
      .select('section')
      .distinct()
      .where('restaurant_id', '=', restaurantId)
      .where('section', 'is not', null)
      .where('deleted_at', 'is', null)
      .execute();

    return result.map((r) => r.section).filter(Boolean) as string[];
  }
}
