import { db } from '../database/kysely';
import type { User, NewUser, UserUpdate } from '../types/database.types';

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return user ?? null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return user ?? null;
  }

  static async create(data: NewUser): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('users')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const user = await this.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  static async update(id: string, data: UserUpdate): Promise<User> {
    await db
      .updateTable('users')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found after update');
    }

    return user;
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db
      .updateTable('users')
      .set({ last_login_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('users')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .execute();
  }
}
