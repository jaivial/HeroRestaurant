import { db } from '../database/kysely';
import type { Session, NewSession, SessionUpdate } from '../types/database.types';

export class SessionRepository {
  static async findByHashedId(hashedSessionId: string): Promise<Session | null> {
    const session = await db
      .selectFrom('sessions')
      .selectAll()
      .where('hashed_session_id', '=', hashedSessionId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    return session ?? null;
  }

  static async findById(id: string): Promise<Session | null> {
    const session = await db
      .selectFrom('sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return session ?? null;
  }

  static async findActiveByUserId(userId: string): Promise<Session[]> {
    return await db
      .selectFrom('sessions')
      .selectAll()
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async create(data: NewSession): Promise<Session> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('sessions')
      .values({
        id,
        ...data,
        created_at: now,
        last_activity_at: now,
      })
      .execute();

    const session = await this.findById(id);
    if (!session) {
      throw new Error('Failed to create session');
    }

    return session;
  }

  static async extendExpiry(id: string, newExpiresAt: Date): Promise<void> {
    await db
      .updateTable('sessions')
      .set({
        expires_at: newExpiresAt,
        last_activity_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  static async updateActivity(id: string): Promise<void> {
    await db
      .updateTable('sessions')
      .set({ last_activity_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  static async revoke(
    id: string,
    reason: 'logout' | 'password_change' | 'security' | 'admin_action'
  ): Promise<void> {
    await db
      .updateTable('sessions')
      .set({
        revoked_at: new Date(),
        revocation_reason: reason,
      })
      .where('id', '=', id)
      .execute();
  }

  static async revokeAllByUserId(
    userId: string,
    reason: 'logout' | 'password_change' | 'security' | 'admin_action',
    exceptSessionId?: string
  ): Promise<number> {
    let query = db
      .updateTable('sessions')
      .set({
        revoked_at: new Date(),
        revocation_reason: reason,
      })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null);

    if (exceptSessionId) {
      query = query.where('id', '!=', exceptSessionId);
    }

    const result = await query.execute();
    return Number(result[0]?.numChangedRows ?? 0);
  }

  static async updateRestaurantContext(id: string, restaurantId: string | null): Promise<void> {
    await db
      .updateTable('sessions')
      .set({ current_restaurant_id: restaurantId })
      .where('id', '=', id)
      .execute();
  }

  static async cleanupExpired(): Promise<number> {
    const result = await db
      .deleteFrom('sessions')
      .where('expires_at', '<', new Date())
      .where('revoked_at', 'is not', null)
      .execute();

    return Number(result[0]?.numDeletedRows ?? 0);
  }
}
