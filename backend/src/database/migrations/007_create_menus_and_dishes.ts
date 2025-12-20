import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Restaurant Settings Table
  await db.schema
    .createTable('restaurant_settings')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)', (col) => col.notNull().unique())
    .addColumn('opening_days', 'json', (col) => col.notNull()) // e.g., ["mon", "tue", ...]
    .addColumn('meal_schedules', 'json', (col) => col.notNull()) // e.g., {"breakfast": true, "lunch": true, "dinner": true}
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'fk_settings_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // 2. Fixed Menus Table
  await db.schema
    .createTable('fixed_menus')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('type', sql`enum('fixed_price', 'open_menu')`, (col) => col.notNull().defaultTo('fixed_price'))
    .addColumn('price', 'decimal(10, 2)')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('drink_included', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('coffee_included', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('availability', 'json', (col) => col.notNull()) // Stores availability for breakfast, lunch, dinner
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'fk_fixed_menus_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // 3. Open Menus Table (Placeholder for future use but requested now)
  await db.schema
    .createTable('open_menus')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('restaurant_id', 'char(36)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'fk_open_menus_restaurant',
      ['restaurant_id'],
      'restaurants',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // 4. Menu Sections Table
  await db.schema
    .createTable('menu_sections')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('fixed_menu_id', 'char(36)')
    .addColumn('open_menu_id', 'char(36)')
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('display_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'fk_sections_fixed_menu',
      ['fixed_menu_id'],
      'fixed_menus',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_sections_open_menu',
      ['open_menu_id'],
      'open_menus',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  // 5. Dishes Table
  await db.schema
    .createTable('dishes')
    .addColumn('id', 'char(36)', (col) => col.primaryKey())
    .addColumn('section_id', 'char(36)', (col) => col.notNull())
    .addColumn('fixed_menu_id', 'char(36)') // Direct link as requested
    .addColumn('open_menu_id', 'char(36)') // Direct link as requested
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('image_url', 'varchar(500)')
    .addColumn('show_image', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('show_description', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('open_modal', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('has_supplement', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('supplement_price', 'decimal(10, 2)')
    .addColumn('allergens', 'json', (col) => col.notNull()) // List of allergen IDs or strings
    .addColumn('display_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`))
    .addForeignKeyConstraint(
      'fk_dishes_section',
      ['section_id'],
      'menu_sections',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_dishes_fixed_menu',
      ['fixed_menu_id'],
      'fixed_menus',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'fk_dishes_open_menu',
      ['open_menu_id'],
      'open_menus',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  console.log('✓ Created menu creator tables');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('dishes').execute();
  await db.schema.dropTable('menu_sections').execute();
  await db.schema.dropTable('open_menus').execute();
  await db.schema.dropTable('fixed_menus').execute();
  await db.schema.dropTable('restaurant_settings').execute();
  console.log('✓ Dropped menu creator tables');
}
