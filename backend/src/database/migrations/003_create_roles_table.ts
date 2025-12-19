/**
 * Migration: 003_create_roles_table
 *
 * Creates the roles table for permission templates.
 * Roles can be system-wide (global) or restaurant-specific (custom).
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('roles')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)') // NULL for system roles
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('permissions', 'bigint unsigned', (col) => col.notNull().defaultTo(0))
    .addColumn('is_system_role', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('display_order', 'int', (col) => col.notNull().defaultTo(0))
    .addColumn('color', 'varchar(7)') // Hex color code
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .addForeignKeyConstraint(
      'fk_roles_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_roles_restaurant')
    .on('roles')
    .column('restaurant_id')
    .execute();

  await db.schema
    .createIndex('idx_roles_restaurant_system')
    .on('roles')
    .columns(['restaurant_id', 'is_system_role'])
    .execute();

  await db.schema
    .createIndex('idx_roles_deleted')
    .on('roles')
    .column('deleted_at')
    .execute();

  console.log('✓ Created roles table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('roles').execute();
  console.log('✓ Dropped roles table');
}
