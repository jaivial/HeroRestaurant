/**
 * Migration: 001_create_users_table
 *
 * Creates the users table for global user identities.
 * Users are independent of restaurants and can belong to multiple workspaces.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('avatar_url', 'varchar(500)')
    .addColumn('phone', 'varchar(50)')
    .addColumn('email_verified_at', 'timestamp')
    .addColumn('status', sql`enum('active', 'suspended', 'pending')`, (col) =>
      col.notNull().defaultTo('pending')
    )
    .addColumn('global_flags', 'bigint unsigned', (col) => col.notNull().defaultTo(0))
    .addColumn('last_login_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_users_email')
    .on('users')
    .column('email')
    .execute();

  await db.schema
    .createIndex('idx_users_status_deleted')
    .on('users')
    .columns(['status', 'deleted_at'])
    .execute();

  await db.schema
    .createIndex('idx_users_created_at')
    .on('users')
    .column('created_at')
    .execute();

  console.log('✓ Created users table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
  console.log('✓ Dropped users table');
}
