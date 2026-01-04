import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('fixed_menus')
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .alterTable('open_menus')
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .alterTable('menu_sections')
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .alterTable('dishes')
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();

  console.log('✓ Added deleted_at column to menu tables');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('fixed_menus').dropColumn('deleted_at').execute();
  await db.schema.alterTable('open_menus').dropColumn('deleted_at').execute();
  await db.schema.alterTable('menu_sections').dropColumn('deleted_at').execute();
  await db.schema.alterTable('dishes').dropColumn('deleted_at').execute();

  console.log('✓ Removed deleted_at column from menu tables');
}
