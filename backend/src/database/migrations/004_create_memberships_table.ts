/**
 * Migration: 004_create_memberships_table
 *
 * Creates the memberships table (user-restaurant junction).
 * Implements the "one user, multiple workspaces" model.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('memberships')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'char(36)', (col) => col.notNull())
    .addColumn('restaurant_id', 'char(36)', (col) => col.notNull())
    .addColumn('role_id', 'char(36)')
    .addColumn('access_flags', 'bigint unsigned', (col) => col.notNull().defaultTo(0))
    .addColumn('display_name', 'varchar(255)')
    .addColumn('joined_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('invited_by_user_id', 'char(36)')
    .addColumn('invitation_accepted_at', 'timestamp')
    .addColumn('status', sql`enum('pending', 'active', 'suspended', 'left')`, (col) =>
      col.notNull().defaultTo('pending')
    )
    .addColumn('last_active_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .addForeignKeyConstraint(
      'fk_memberships_user',
      ['user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_memberships_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_memberships_role',
      ['role_id'],
      'roles',
      ['id'],
      (cb) => cb.onDelete('set null')
    )
    .addForeignKeyConstraint(
      'fk_memberships_invited_by',
      ['invited_by_user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('set null')
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_memberships_user_restaurant')
    .unique()
    .on('memberships')
    .columns(['user_id', 'restaurant_id', 'deleted_at'])
    .execute();

  await db.schema
    .createIndex('idx_memberships_user')
    .on('memberships')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_memberships_restaurant')
    .on('memberships')
    .column('restaurant_id')
    .execute();

  await db.schema
    .createIndex('idx_memberships_role')
    .on('memberships')
    .column('role_id')
    .execute();

  await db.schema
    .createIndex('idx_memberships_status_deleted')
    .on('memberships')
    .columns(['status', 'deleted_at'])
    .execute();

  console.log('✓ Created memberships table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('memberships').execute();
  console.log('✓ Dropped memberships table');
}
