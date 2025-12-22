import { db } from '../database/kysely';
import type { UserPreference, NewUserPreference, UserPreferenceUpdate } from '../types/database.types';

export class PreferenceRepository {
  static async findByUserAndWorkspace(userId: string, workspaceId: string): Promise<UserPreference[]> {
    return await db
      .selectFrom('user_preferences')
      .selectAll()
      .where('user_id', '=', userId)
      .where('workspace_id', '=', workspaceId)
      .execute();
  }

  static async findByKey(userId: string, workspaceId: string, key: string): Promise<UserPreference | null> {
    const pref = await db
      .selectFrom('user_preferences')
      .selectAll()
      .where('user_id', '=', userId)
      .where('workspace_id', '=', workspaceId)
      .where('preference_key', '=', key)
      .executeTakeFirst();

    return pref ?? null;
  }

  static async upsert(userId: string, workspaceId: string, key: string, value: string): Promise<UserPreference> {
    const existing = await this.findByKey(userId, workspaceId, key);

    if (existing) {
      await db
        .updateTable('user_preferences')
        .set({
          preference_value: value,
        })
        .where('id', '=', existing.id)
        .execute();
      
      return (await this.findByKey(userId, workspaceId, key))!;
    } else {
      const id = crypto.randomUUID();
      await db
        .insertInto('user_preferences')
        .values({
          id,
          user_id: userId,
          workspace_id: workspaceId,
          preference_key: key,
          preference_value: value,
        })
        .execute();
      
      return (await this.findByKey(userId, workspaceId, key))!;
    }
  }
}
