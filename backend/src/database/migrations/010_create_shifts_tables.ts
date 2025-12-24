/**
 * Migration: 010_create_shifts_tables
 *
 * Creates tables for member contractual hours and shift tracking.
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create member_contracts table
  await db.schema
    .createTable('member_contracts')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('membership_id', 'char(36)', (col) => 
      col.notNull().references('memberships.id').onDelete('cascade')
    )
    .addColumn('weekly_hours', 'decimal(5, 2)', (col) => col.notNull())
    .addColumn('effective_from', 'date', (col) => col.notNull())
    .addColumn('effective_to', 'date')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .execute();

  // Create member_shifts table
  await db.schema
    .createTable('member_shifts')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('membership_id', 'char(36)', (col) => 
      col.notNull().references('memberships.id').onDelete('cascade')
    )
    .addColumn('punch_in_at', 'timestamp', (col) => col.notNull())
    .addColumn('punch_out_at', 'timestamp')
    .addColumn('total_minutes', 'integer')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_contracts_membership')
    .on('member_contracts')
    .column('membership_id')
    .execute();

  await db.schema
    .createIndex('idx_shifts_membership')
    .on('member_shifts')
    .column('membership_id')
    .execute();

  await db.schema
    .createIndex('idx_shifts_punch_in')
    .on('member_shifts')
    .column('punch_in_at')
    .execute();

  console.log('✓ Created shifts and contracts tables');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('member_shifts').execute();
  await db.schema.dropTable('member_contracts').execute();
  console.log('✓ Dropped shifts and contracts tables');
}

