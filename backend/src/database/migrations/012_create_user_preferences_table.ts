/**
 * Migration: 012_create_user_preferences_table
 *
 * Creates the user_preferences table to store user-specific settings per workspace.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_preferences')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'char(36)', (col) => col.notNull())
    .addColumn('workspace_id', 'char(36)', (col) => col.notNull())
    .addColumn('preference_key', 'varchar(100)', (col) => col.notNull())
    .addColumn('preference_value', 'json', (col) => col.notNull())
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addForeignKeyConstraint(
      'user_preferences_ibfk_1',
      ['user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'user_preferences_ibfk_2',
      ['workspace_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addUniqueConstraint('user_workspace_pref', ['user_id', 'workspace_id', 'preference_key'])
    .execute();

  // Create index on workspace_id (automatically named workspace_id in the original table)
  await db.schema
    .createIndex('workspace_id')
    .on('user_preferences')
    .column('workspace_id')
    .execute();

  console.log('✓ Created user_preferences table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_preferences').execute();
  console.log('✓ Dropped user_preferences table');
}
