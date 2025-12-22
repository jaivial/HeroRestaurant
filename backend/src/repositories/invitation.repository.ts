import { db } from '../database/kysely';
import type { Invitation, NewInvitation, InvitationUpdate } from '../types/database.types';

export class InvitationRepository {
  static async findById(id: string): Promise<Invitation | null> {
    const invitation = await db
      .selectFrom('invitations')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return invitation ?? null;
  }

  static async findByToken(token: string): Promise<Invitation | null> {
    const invitation = await db
      .selectFrom('invitations')
      .selectAll()
      .where('token', '=', token)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return invitation ?? null;
  }

  static async create(data: NewInvitation): Promise<Invitation> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('invitations')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const invitation = await this.findById(id);
    if (!invitation) {
      throw new Error('Failed to create invitation');
    }

    return invitation;
  }

  static async update(id: string, data: InvitationUpdate): Promise<Invitation> {
    await db
      .updateTable('invitations')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const invitation = await this.findById(id);
    if (!invitation) {
      throw new Error('Invitation not found after update');
    }

    return invitation;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('invitations')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .execute();
  }
}
