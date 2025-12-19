/**
 * Migration: 006_create_login_attempts_table
 *
 * Creates the login_attempts table for brute force protection.
 * Tracks both successful and failed login attempts for rate limiting.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('login_attempts')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('ip_address', 'varchar(45)', (col) => col.notNull())
    .addColumn('user_agent', 'varchar(500)')
    .addColumn('success', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('attempted_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_login_attempts_email')
    .on('login_attempts')
    .column('email')
    .execute();

  await db.schema
    .createIndex('idx_login_attempts_ip')
    .on('login_attempts')
    .column('ip_address')
    .execute();

  await db.schema
    .createIndex('idx_login_attempts_attempted')
    .on('login_attempts')
    .column('attempted_at')
    .execute();

  await db.schema
    .createIndex('idx_login_attempts_email_attempted')
    .on('login_attempts')
    .columns(['email', 'attempted_at'])
    .execute();

  console.log('✓ Created login_attempts table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('login_attempts').execute();
  console.log('✓ Dropped login_attempts table');
}
