import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)', (col) =>
      col.notNull().references('restaurants.id').onDelete('cascade')
    )
    .addColumn('role_id', 'char(36)', (col) =>
      col.references('roles.id').onDelete('set null')
    )
    .addColumn('inviter_id', 'char(36)', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('email', 'varchar(255)')
    .addColumn('token', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addColumn('used_at', 'timestamp')
    .addColumn('status', sql`enum('pending', 'accepted', 'expired', 'revoked')`, (col) =>
      col.notNull().defaultTo('pending')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    )
    .addColumn('deleted_at', 'timestamp')
    .execute();

  // Create indexes
  await db.schema.createIndex('idx_invitations_restaurant').on('invitations').column('restaurant_id').execute();
  await db.schema.createIndex('idx_invitations_role').on('invitations').column('role_id').execute();
  await db.schema.createIndex('idx_invitations_inviter').on('invitations').column('inviter_id').execute();
  await db.schema.createIndex('idx_invitations_email').on('invitations').column('email').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('invitations').execute();
}
