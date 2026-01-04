import { Elysia, t } from 'elysia';
import { menuRepository } from '../repositories/menu.repository';
import { shortUrlRepository } from '../repositories/shortUrl.repository';
import { db } from '../database/kysely';

const parseMenuFromDB = (menu: any) => ({
  ...menu,
  isActive: !!menu.is_active,
  drinkIncluded: !!menu.drink_included,
  coffeeIncluded: !!menu.coffee_included,
  availability: typeof menu.availability === 'string' 
    ? JSON.parse(menu.availability) 
    : (menu.availability || { breakfast: [], lunch: [], dinner: [] })
});

const parseDishFromDB = (dish: any) => ({
  ...dish,
  allergens: typeof dish.allergens === 'string'
    ? JSON.parse(dish.allergens)
    : (dish.allergens || []),
  showImage: !!dish.show_image,
  showDescription: !!dish.show_description,
  openModal: !!dish.open_modal,
  hasSupplement: !!dish.has_supplement,
  supplementPrice: dish.supplement_price,
  imageUrl: dish.image_url,
  sectionId: dish.section_id,
  displayOrder: dish.display_order
});

export const menuRoutes = new Elysia({ prefix: '/api/menu' })
  .get('/public/:menuId', async ({ params, set }) => {
    try {
      const { menuId } = params;

      const menu = await menuRepository.getFixedWithSectionsAndDishes(menuId);
      
      if (!menu) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu not found'
          }
        };
      }

      if (!menu.is_active) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'MENU_INACTIVE',
            message: 'This menu is currently inactive'
          }
        };
      }

      const restaurant = await db
        .selectFrom('restaurants')
        .select(['id', 'name', 'slug'])
        .where('id', '=', menu.restaurant_id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!restaurant) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'RESTAURANT_NOT_FOUND',
            message: 'Restaurant not found'
          }
        };
      }

      const parsedMenu = {
        ...parseMenuFromDB(menu),
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug
        },
        sections: menu.sections.map((s: any) => ({
          ...s,
          dishes: s.dishes.map(parseDishFromDB)
        }))
      };

      set.status = 200;
      return {
        success: true,
        data: parsedMenu
      };
    } catch (error: any) {
      console.error('[REST] Public menu error:', error);
      set.status = 500;
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch menu'
        }
      };
    }
  })
  .post('/:menuId/short-url', async ({ params, set }) => {
    try {
      const { menuId } = params;

      const menu = await menuRepository.getFixedById(menuId);
      if (!menu) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Menu not found'
          }
        };
      }

      const shortUrl = await shortUrlRepository.getOrCreate(menuId);
      const restaurant = await db
        .selectFrom('restaurants')
        .select(['slug'])
        .where('id', '=', menu.restaurant_id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
      const fullUrl = `${origin}/menu/${restaurant?.slug}/${menuId}`;
      const shortLink = `${origin}/m/${shortUrl.code}`;

      set.status = 200;
      return {
        success: true,
        data: {
          code: shortUrl.code,
          shortUrl: shortLink,
          fullUrl
        }
      };
    } catch (error: any) {
      console.error('[REST] Short URL generation error:', error);
      set.status = 500;
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate short URL'
        }
      };
    }
  });

export const shortUrlRedirect = new Elysia()
  .get('/m/:code', async ({ params, set, redirect }) => {
    try {
      const { code } = params;

      const shortUrl = await shortUrlRepository.getByCode(code);
      if (!shortUrl) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Short URL not found'
          }
        };
      }

      const menu = await menuRepository.getFixedById(shortUrl.menu_id);
      if (!menu) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'MENU_NOT_FOUND',
            message: 'Menu not found'
          }
        };
      }

      const restaurant = await db
        .selectFrom('restaurants')
        .select(['slug'])
        .where('id', '=', menu.restaurant_id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!restaurant) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'RESTAURANT_NOT_FOUND',
            message: 'Restaurant not found'
          }
        };
      }

      return redirect(`/menu/${restaurant.slug}/${menu.id}`, 302);
    } catch (error: any) {
      console.error('[REST] Short URL redirect error:', error);
      set.status = 500;
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to redirect'
        }
      };
    }
  });
