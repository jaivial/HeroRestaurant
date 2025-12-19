/**
 * Migration: 002_create_restaurants_table
 *
 * Creates the restaurants table for tenant/workspace data.
 * Each restaurant is an isolated data silo with its own settings and features.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('restaurants')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('logo_url', 'varchar(500)')
    .addColumn('cover_url', 'varchar(500)')
    .addColumn('address', 'varchar(500)')
    .addColumn('city', 'varchar(100)')
    .addColumn('state', 'varchar(100)')
    .addColumn('postal_code', 'varchar(20)')
    .addColumn('country', 'varchar(100)')
    .addColumn('timezone', 'varchar(50)', (col) => col.notNull().defaultTo('UTC'))
    .addColumn('currency', 'varchar(3)', (col) => col.notNull().defaultTo('USD'))
    .addColumn('contact_email', 'varchar(255)')
    .addColumn('contact_phone', 'varchar(50)')
    .addColumn('feature_flags', sql`bigint unsigned`, (col) => col.notNull().defaultTo(0))
    .addColumn('subscription_tier', sql`enum('free', 'starter', 'professional', 'enterprise')`, (col) =>
      col.notNull().defaultTo('free')
    )
    .addColumn('owner_user_id', 'char(36)', (col) => col.notNull())
    .addColumn('status', sql`enum('active', 'trial', 'suspended', 'cancelled')`, (col) =>
      col.notNull().defaultTo('trial')
    )
    .addColumn('trial_ends_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .addForeignKeyConstraint(
      'fk_restaurants_owner_user',
      ['owner_user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('restrict')
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_restaurants_slug')
    .on('restaurants')
    .column('slug')
    .execute();

  await db.schema
    .createIndex('idx_restaurants_owner')
    .on('restaurants')
    .column('owner_user_id')
    .execute();

  await db.schema
    .createIndex('idx_restaurants_status_deleted')
    .on('restaurants')
    .columns(['status', 'deleted_at'])
    .execute();

  await db.schema
    .createIndex('idx_restaurants_created_at')
    .on('restaurants')
    .column('created_at')
    .execute();

  console.log('✓ Created restaurants table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('restaurants').execute();
  console.log('✓ Dropped restaurants table');
}
