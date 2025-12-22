/**
 * Migration: 011_create_invitations_table
 *
 * Creates the invitations table to manage workspace invites.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)', (col) => col.notNull())
    .addColumn('role_id', 'char(36)')
    .addColumn('inviter_id', 'char(36)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)')
    .addColumn('token', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addColumn('used_at', 'timestamp')
    .addColumn('status', sql`enum('pending', 'accepted', 'expired', 'revoked')`, (col) => 
      col.notNull().defaultTo('pending')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .addForeignKeyConstraint(
      'fk_invitations_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_invitations_role',
      ['role_id'],
      'roles',
      ['id'],
      (cb) => cb.onDelete('set null')
    )
    .addForeignKeyConstraint(
      'fk_invitations_inviter',
      ['inviter_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_invitations_token')
    .on('invitations')
    .column('token')
    .execute();

  await db.schema
    .createIndex('idx_invitations_restaurant')
    .on('invitations')
    .column('restaurant_id')
    .execute();

  await db.schema
    .createIndex('idx_invitations_email')
    .on('invitations')
    .column('email')
    .execute();

  console.log('✓ Created invitations table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('invitations').execute();
  console.log('✓ Dropped invitations table');
}
