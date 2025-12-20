import { db } from '../database/kysely';
import type { 
  FixedMenu, NewFixedMenu, FixedMenuUpdate,
  OpenMenu, NewOpenMenu, OpenMenuUpdate,
  MenuSection, NewMenuSection, MenuSectionUpdate,
  Dish, NewDish, DishUpdate,
  RestaurantSettings, NewRestaurantSettings, RestaurantSettingsUpdate
} from '../types/database.types';

export const menuRepository = {
  // Menu Methods
  async createFixed(menu: NewFixedMenu): Promise<FixedMenu> {
    const id = crypto.randomUUID();
    await db.insertInto('fixed_menus')
      .values({ ...menu, id })
      .execute();
    return this.getFixedById(id) as Promise<FixedMenu>;
  },

  async getFixedById(id: string): Promise<FixedMenu | undefined> {
    return await db.selectFrom('fixed_menus')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async listFixedByRestaurant(restaurantId: string): Promise<FixedMenu[]> {
    return await db.selectFrom('fixed_menus')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .orderBy('created_at', 'desc')
      .execute();
  },

  async updateFixed(id: string, update: FixedMenuUpdate): Promise<void> {
    await db.updateTable('fixed_menus')
      .set(update)
      .where('id', '=', id)
      .execute();
  },

  async deleteFixed(id: string): Promise<void> {
    await db.deleteFrom('fixed_menus')
      .where('id', '=', id)
      .execute();
  },

  // Section Methods
  async createSection(section: NewMenuSection): Promise<MenuSection> {
    const id = crypto.randomUUID();
    await db.insertInto('menu_sections')
      .values({ ...section, id })
      .execute();
    return await db.selectFrom('menu_sections').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
  },

  async listSectionsByMenu(menuId: string, type: 'fixed' | 'open'): Promise<MenuSection[]> {
    const query = db.selectFrom('menu_sections').selectAll();
    if (type === 'fixed') {
      return await query.where('fixed_menu_id', '=', menuId).orderBy('display_order', 'asc').execute();
    } else {
      return await query.where('open_menu_id', '=', menuId).orderBy('display_order', 'asc').execute();
    }
  },

  async updateSection(id: string, update: MenuSectionUpdate): Promise<void> {
    await db.updateTable('menu_sections')
      .set(update)
      .where('id', '=', id)
      .execute();
  },

  async deleteSection(id: string): Promise<void> {
    await db.deleteFrom('menu_sections')
      .where('id', '=', id)
      .execute();
  },

  // Dish Methods
  async createDish(dish: NewDish): Promise<Dish> {
    const id = crypto.randomUUID();
    await db.insertInto('dishes')
      .values({ ...dish, id })
      .execute();
    return await db.selectFrom('dishes').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
  },

  async listDishesBySection(sectionId: string): Promise<Dish[]> {
    return await db.selectFrom('dishes')
      .selectAll()
      .where('section_id', '=', sectionId)
      .orderBy('display_order', 'asc')
      .execute();
  },

  async updateDish(id: string, update: DishUpdate): Promise<void> {
    await db.updateTable('dishes')
      .set(update)
      .where('id', '=', id)
      .execute();
  },

  async deleteDish(id: string): Promise<void> {
    await db.deleteFrom('dishes')
      .where('id', '=', id)
      .execute();
  },

  async reorderDishes(dishes: { id: string, display_order: number }[]): Promise<void> {
    await db.transaction().execute(async (trx) => {
      for (const dish of dishes) {
        await trx.updateTable('dishes')
          .set({ display_order: dish.display_order })
          .where('id', '=', dish.id)
          .execute();
      }
    });
  },

  // Settings Methods
  async getSettings(restaurantId: string): Promise<RestaurantSettings | undefined> {
    return await db.selectFrom('restaurant_settings')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .executeTakeFirst();
  },

  async upsertSettings(restaurantId: string, settings: Partial<NewRestaurantSettings>): Promise<RestaurantSettings> {
    const existing = await this.getSettings(restaurantId);
    if (existing) {
      await db.updateTable('restaurant_settings')
        .set(settings)
        .where('restaurant_id', '=', restaurantId)
        .execute();
      return (await this.getSettings(restaurantId))!;
    } else {
      const id = crypto.randomUUID();
      await db.insertInto('restaurant_settings')
        .values({
          ...settings as NewRestaurantSettings,
          id,
          restaurant_id: restaurantId,
          opening_days: settings.opening_days || '[]',
          meal_schedules: settings.meal_schedules || '{}'
        })
        .execute();
      return (await this.getSettings(restaurantId))!;
    }
  }
};
