import { db } from '../database/kysely';
import type { Role, NewRole, RoleUpdate } from '../types/database.types';

export class RoleRepository {
  static async findById(id: string): Promise<Role | null> {
    const role = await db
      .selectFrom('roles')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return role ?? null;
  }

  static async findByRestaurantId(restaurantId: string): Promise<Role[]> {
    return await db
      .selectFrom('roles')
      .selectAll()
      .where((eb) => eb.or([
        eb('restaurant_id', '=', restaurantId),
        eb('is_system_role', '=', true)
      ]))
      .where('deleted_at', 'is', null)
      .orderBy('display_order', 'desc')
      .execute();
  }

  static async create(data: NewRole): Promise<Role> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('roles')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const role = await this.findById(id);
    if (!role) {
      throw new Error('Failed to create role');
    }

    return role;
  }

  static async update(id: string, data: RoleUpdate): Promise<Role> {
    await db
      .updateTable('roles')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const role = await this.findById(id);
    if (!role) {
      throw new Error('Role not found after update');
    }

    return role;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('roles')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .execute();
  }
}

