import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_preferences')
    .ifNotExists()
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'char(36)', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('workspace_id', 'char(36)', (col) =>
      col.notNull().references('restaurants.id').onDelete('cascade')
    )
    .addColumn('preference_key', 'varchar(100)', (col) => col.notNull())
    .addColumn('preference_value', 'json', (col) => col.notNull())
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addUniqueConstraint('user_workspace_pref', ['user_id', 'workspace_id', 'preference_key'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_preferences').execute();
}
