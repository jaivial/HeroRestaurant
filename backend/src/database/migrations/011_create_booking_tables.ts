/**
 * Migration: 011_create_booking_tables
 *
 * Creates tables for the booking manager feature:
 * - tables: Restaurant table definitions
 * - table_groups: Groupings of tables for large parties
 * - guests: Guest profiles with visit history
 * - bookings: Reservation records
 * - waitlist: Queue management
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // ─────────────────────────────────────────────────────────────────────────────
  // TABLES TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('tables')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('capacity', 'integer', (col) => col.notNull())
    .addColumn('min_capacity', 'integer', (col) => col.defaultTo(1))
    .addColumn('section', 'varchar(50)')
    .addColumn('position_x', 'decimal(10, 2)')
    .addColumn('position_y', 'decimal(10, 2)')
    .addColumn('shape', 'varchar(20)', (col) => col.defaultTo('square'))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('idx_tables_restaurant')
    .on('tables')
    .column('restaurant_id')
    .execute();

  await db.schema
    .createIndex('idx_tables_capacity')
    .on('tables')
    .columns(['restaurant_id', 'capacity'])
    .execute();

  // ─────────────────────────────────────────────────────────────────────────────
  // TABLE GROUPS TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('table_groups')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('min_capacity', 'integer', (col) => col.notNull())
    .addColumn('max_capacity', 'integer', (col) => col.notNull())
    .addColumn('table_ids', 'json')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('idx_table_groups_restaurant')
    .on('table_groups')
    .column('restaurant_id')
    .execute();

  // ─────────────────────────────────────────────────────────────────────────────
  // GUESTS TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('guests')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)')
    .addColumn('phone', 'varchar(20)', (col) => col.notNull())
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('notes', 'text')
    .addColumn('total_visits', 'integer', (col) => col.defaultTo(0))
    .addColumn('total_no_shows', 'integer', (col) => col.defaultTo(0))
    .addColumn('total_cancellations', 'integer', (col) => col.defaultTo(0))
    .addColumn('last_visit_at', 'timestamp')
    .addColumn('preferences', 'json')
    .addColumn('tags', 'json')
    .addColumn('blocked', 'boolean', (col) => col.defaultTo(false))
    .addColumn('blocked_reason', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('idx_guests_restaurant')
    .on('guests')
    .column('restaurant_id')
    .execute();

  await db.schema
    .createIndex('idx_guests_phone')
    .on('guests')
    .columns(['restaurant_id', 'phone'])
    .execute();

  await db.schema
    .createIndex('idx_guests_email')
    .on('guests')
    .columns(['restaurant_id', 'email'])
    .execute();

  // ─────────────────────────────────────────────────────────────────────────────
  // BOOKINGS TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('bookings')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('guest_id', 'varchar(36)')
    .addColumn('table_id', 'varchar(36)')
    .addColumn('table_group_id', 'varchar(36)')
    .addColumn('guest_name', 'varchar(200)', (col) => col.notNull())
    .addColumn('guest_email', 'varchar(255)')
    .addColumn('guest_phone', 'varchar(20)', (col) => col.notNull())
    .addColumn('party_size', 'integer', (col) => col.notNull())
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('start_time', 'time', (col) => col.notNull())
    .addColumn('end_time', 'time', (col) => col.notNull())
    .addColumn('duration_minutes', 'integer', (col) => col.defaultTo(90))
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('pending'))
    .addColumn('source', 'varchar(20)', (col) => col.notNull().defaultTo('phone'))
    .addColumn('notes', 'text')
    .addColumn('dietary_requirements', 'json')
    .addColumn('confirmation_sent_at', 'timestamp')
    .addColumn('reminder_sent_at', 'timestamp')
    .addColumn('cancelled_at', 'timestamp')
    .addColumn('cancelled_by', 'varchar(20)')
    .addColumn('cancellation_reason', 'text')
    .addColumn('created_by_user_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('idx_bookings_restaurant_date')
    .on('bookings')
    .columns(['restaurant_id', 'date'])
    .execute();

  await db.schema
    .createIndex('idx_bookings_guest')
    .on('bookings')
    .column('guest_id')
    .execute();

  await db.schema
    .createIndex('idx_bookings_status')
    .on('bookings')
    .column('status')
    .execute();

  await db.schema
    .createIndex('idx_bookings_datetime')
    .on('bookings')
    .columns(['restaurant_id', 'date', 'start_time'])
    .execute();

  await db.schema
    .createIndex('idx_bookings_table_time')
    .on('bookings')
    .columns(['table_id', 'date', 'start_time', 'end_time'])
    .execute();

  // ─────────────────────────────────────────────────────────────────────────────
  // WAITLIST TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('waitlist')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'varchar(36)', (col) => col.notNull())
    .addColumn('guest_name', 'varchar(200)', (col) => col.notNull())
    .addColumn('guest_phone', 'varchar(20)', (col) => col.notNull())
    .addColumn('guest_email', 'varchar(255)')
    .addColumn('party_size', 'integer', (col) => col.notNull())
    .addColumn('quoted_wait_minutes', 'integer')
    .addColumn('notes', 'text')
    .addColumn('notified_at', 'timestamp')
    .addColumn('seated_at', 'timestamp')
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('waiting'))
    .addColumn('position', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createIndex('idx_waitlist_restaurant')
    .on('waitlist')
    .columns(['restaurant_id', 'status'])
    .execute();

  await db.schema
    .createIndex('idx_waitlist_position')
    .on('waitlist')
    .columns(['restaurant_id', 'position'])
    .execute();

  console.log('✓ Created booking tables');
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop in reverse order with foreign key considerations
  await db.schema.dropTable('waitlist').execute();
  await db.schema.dropTable('bookings').execute();
  await db.schema.dropTable('guests').execute();
  await db.schema.dropTable('table_groups').execute();
  await db.schema.dropTable('tables').execute();
  console.log('✓ Dropped booking tables');
}
