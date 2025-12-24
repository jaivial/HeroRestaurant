/**
 * Migration: 014_add_visual_fields_to_scheduled_shifts
 *
 * Adds color and category fields to scheduled shifts for better visual UI effects.
 */

import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('scheduled_shifts')
    .addColumn('color', 'varchar(20)')
    .addColumn('label', 'varchar(50)')
    .execute();

  console.log('✓ Added color and label to scheduled_shifts');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('scheduled_shifts')
    .dropColumn('color')
    .dropColumn('label')
    .execute();
  console.log('✓ Removed color and label from scheduled_shifts');
}
