import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('short_urls')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('code', 'varchar(10)', (col) => col.notNull().unique())
    .addColumn('menu_id', 'char(36)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_short_urls_code')
    .on('short_urls')
    .column('code')
    .execute();

  await db.schema
    .alterTable('short_urls')
    .addForeignKeyConstraint(
      'fk_short_urls_menu',
      ['menu_id'],
      'fixed_menus',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  console.log('✓ Created short_urls table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('short_urls').execute();
  console.log('✓ Dropped short_urls table');
}
