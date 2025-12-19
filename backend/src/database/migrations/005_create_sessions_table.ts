/**
 * Migration: 005_create_sessions_table
 *
 * Creates the sessions table for authentication session management.
 * Implements 21-hour sliding expiry with revocation support.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('hashed_session_id', 'varchar(64)', (col) => col.notNull().unique())
    .addColumn('user_id', 'char(36)', (col) => col.notNull())
    .addColumn('current_restaurant_id', 'char(36)')
    .addColumn('device_fingerprint', 'varchar(255)')
    .addColumn('user_agent', 'varchar(500)')
    .addColumn('ip_address', 'varchar(45)') // IPv6 compatible
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addColumn('last_activity_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('revoked_at', 'timestamp')
    .addColumn('revocation_reason', sql`enum('logout', 'password_change', 'security', 'admin_action')`)
    .addForeignKeyConstraint(
      'fk_sessions_user',
      ['user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_sessions_restaurant',
      ['current_restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('set null')
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_sessions_hashed_id')
    .unique()
    .on('sessions')
    .column('hashed_session_id')
    .execute();

  await db.schema
    .createIndex('idx_sessions_user')
    .on('sessions')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_sessions_expires')
    .on('sessions')
    .column('expires_at')
    .execute();

  await db.schema
    .createIndex('idx_sessions_user_revoked')
    .on('sessions')
    .columns(['user_id', 'revoked_at'])
    .execute();

  await db.schema
    .createIndex('idx_sessions_created')
    .on('sessions')
    .column('created_at')
    .execute();

  console.log('✓ Created sessions table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('sessions').execute();
  console.log('✓ Dropped sessions table');
}
