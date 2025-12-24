import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // This migration was previously executed but the file was missing.
  // It seems it added visual fields to scheduled shifts.
  // We keep this file to satisfy the Kysely migrator.
  console.log('✓ Satisfied missing migration 014_add_visual_fields_to_scheduled_shifts');
}

export async function down(db: Kysely<any>): Promise<void> {
  // Nothing to revert
}
