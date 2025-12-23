/**
 * Migration: 013_create_scheduled_shifts_table
 *
 * Creates table for planned/scheduled shifts.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('scheduled_shifts')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('membership_id', 'char(36)', (col) => 
      col.notNull().references('memberships.id').onDelete('cascade')
    )
    .addColumn('start_at', 'timestamp', (col) => col.notNull())
    .addColumn('end_at', 'timestamp', (col) => col.notNull())
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_scheduled_shifts_membership')
    .on('scheduled_shifts')
    .column('membership_id')
    .execute();

  await db.schema
    .createIndex('idx_scheduled_shifts_start')
    .on('scheduled_shifts')
    .column('start_at')
    .execute();

  console.log('✓ Created scheduled_shifts table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('scheduled_shifts').execute();
  console.log('✓ Dropped scheduled_shifts table');
}
