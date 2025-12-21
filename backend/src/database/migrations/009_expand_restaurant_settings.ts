import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Add new columns to restaurants table for branding and social
  await db.schema
    .alterTable('restaurants')
    .addColumn('website_url', 'varchar(500)')
    .addColumn('instagram_url', 'varchar(500)')
    .addColumn('facebook_url', 'varchar(500)')
    .addColumn('primary_color', 'varchar(7)', (col) => col.defaultTo('#007AFF'))
    .addColumn('default_language', 'varchar(10)', (col) => col.notNull().defaultTo('en'))
    .addColumn('default_tax_rate', 'decimal(5, 2)', (col) => col.notNull().defaultTo(0.00))
    .execute();

  // 2. Add opening_hours to restaurant_settings table for granular scheduling
  await db.schema
    .alterTable('restaurant_settings')
    .addColumn('opening_hours', 'json')
    .execute();

  console.log('✓ Migration 009: Expanded restaurant settings columns');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('restaurant_settings')
    .dropColumn('opening_hours')
    .execute();

  await db.schema
    .alterTable('restaurants')
    .dropColumn('website_url')
    .dropColumn('instagram_url')
    .dropColumn('facebook_url')
    .dropColumn('primary_color')
    .dropColumn('default_language')
    .dropColumn('default_tax_rate')
    .execute();

  console.log('✓ Migration 009: Rolled back expanded restaurant settings');
}

