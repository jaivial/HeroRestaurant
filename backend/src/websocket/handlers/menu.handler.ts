import { menuRepository } from '../../repositories/menu.repository';
import type { WSConnection } from '../state/connections';
import { createErrorResponse, createSuccessResponse } from '../../types/websocket.types';
import { ImageService } from '../../services/image.service';
import { StorageService } from '../../services/storage.service';
import { PermissionService } from '../../services/permission.service';
import { MEMBER_FLAGS } from '../../constants/permissions';

const parseMenuFromDB = (menu: any) => ({
  ...menu,
  price: menu.price ? parseFloat(menu.price) : menu.price,
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
  supplementPrice: dish.supplement_price ? parseFloat(dish.supplement_price) : dish.supplement_price,
  imageUrl: dish.image_url,
  sectionId: dish.section_id,
  displayOrder: dish.display_order
});

export const menuHandlers = {
  async create(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const menu = await menuRepository.createFixed({
        restaurant_id: payload.restaurantId,
        title: payload.title,
        type: payload.type,
        price: payload.price,
        is_active: payload.isActive ?? false,
        drink_included: payload.drinkIncluded ?? false,
        coffee_included: payload.coffeeIncluded ?? false,
        availability: JSON.stringify(payload.availability || { breakfast: [], lunch: [], dinner: [] }),
      });
      return { data: parseMenuFromDB(menu) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async list(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_MENU
      );

      const menus = await menuRepository.listFixedByRestaurant(payload.restaurantId);
      const parsedMenus = menus.map(parseMenuFromDB);
      return { data: parsedMenus };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async get(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const menu = await menuRepository.getFixedWithSectionsAndDishes(payload.menuId);
      if (!menu) {
        return { error: { code: 'NOT_FOUND', message: 'Menu not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        menu.restaurant_id,
        MEMBER_FLAGS.CAN_VIEW_MENU
      );
      
      const parsedMenu = {
        ...parseMenuFromDB(menu),
        sections: menu.sections.map((s: any) => ({
          ...s,
          dishes: s.dishes.map(parseDishFromDB)
        }))
      };
      
      return { data: parsedMenu };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async update(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const menu = await menuRepository.getFixedById(payload.menuId);
      if (!menu) {
        return { error: { code: 'NOT_FOUND', message: 'Menu not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        menu.restaurant_id,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const { menuId, ...update } = payload;
      const dbUpdate: any = {};
      
      if (update.title !== undefined) dbUpdate.title = update.title;
      if (update.price !== undefined) dbUpdate.price = update.price;
      if (update.availability) dbUpdate.availability = JSON.stringify(update.availability);
      if (update.drinkIncluded !== undefined) dbUpdate.drink_included = update.drinkIncluded;
      if (update.coffeeIncluded !== undefined) dbUpdate.coffee_included = update.coffeeIncluded;
      if (update.isActive !== undefined) dbUpdate.is_active = update.isActive;

      await menuRepository.updateFixed(menuId, dbUpdate);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async delete(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const menu = await menuRepository.getFixedById(payload.menuId);
      if (!menu) {
        return { error: { code: 'NOT_FOUND', message: 'Menu not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        menu.restaurant_id,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      await menuRepository.deleteFixed(payload.menuId);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  // Section Handlers
  async createSection(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const menu = await menuRepository.getFixedById(payload.menuId);
      if (!menu) {
        return { error: { code: 'NOT_FOUND', message: 'Menu not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        menu.restaurant_id,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const section = await menuRepository.createSection({
        name: payload.name,
        fixed_menu_id: payload.menuType === 'fixed' ? payload.menuId : null,
        open_menu_id: payload.menuType === 'open' ? payload.menuId : null,
        display_order: payload.displayOrder || 0
      });
      return { data: section };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateSection(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const { sectionId, restaurantId, ...update } = payload;
      await menuRepository.updateSection(sectionId, update);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async deleteSection(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      await menuRepository.deleteSection(payload.sectionId);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  // Dish Handlers
  async createDish(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      const menu = await menuRepository.getFixedById(payload.menuId);
      if (!menu) {
        return { error: { code: 'NOT_FOUND', message: 'Menu not found' } };
      }

      await PermissionService.requirePermissions(
        userId,
        menu.restaurant_id,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const dish = await menuRepository.createDish({
        section_id: payload.sectionId,
        fixed_menu_id: payload.menuType === 'fixed' ? payload.menuId : null,
        open_menu_id: payload.menuType === 'open' ? payload.menuId : null,
        title: payload.title,
        description: payload.description,
        image_url: payload.imageUrl,
        show_image: payload.showImage ?? true,
        show_description: payload.showDescription ?? true,
        open_modal: payload.openModal ?? false,
        has_supplement: payload.hasSupplement ?? false,
        supplement_price: payload.supplementPrice,
        display_order: payload.displayOrder ?? 0,
        allergens: JSON.stringify(payload.allergens || []),
      });
      return { data: parseDishFromDB(dish) };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateDish(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const { dishId, restaurantId, ...update } = payload;
      const dbUpdate: any = { ...update };

      if (update.allergens) {
        dbUpdate.allergens = JSON.stringify(update.allergens);
      }
      if (update.imageUrl !== undefined) dbUpdate.image_url = update.imageUrl;
      if (update.showImage !== undefined) dbUpdate.show_image = update.showImage;
      if (update.showDescription !== undefined) dbUpdate.show_description = update.showDescription;
      if (update.openModal !== undefined) dbUpdate.open_modal = update.openModal;
      if (update.hasSupplement !== undefined) dbUpdate.has_supplement = update.hasSupplement;
      if (update.supplementPrice !== undefined) dbUpdate.supplement_price = update.supplementPrice;
      if (update.displayOrder !== undefined) dbUpdate.display_order = update.displayOrder;
      if (update.sectionId !== undefined) dbUpdate.section_id = update.sectionId;

      await menuRepository.updateDish(dishId, dbUpdate);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async deleteDish(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      await menuRepository.deleteDish(payload.dishId);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async reorderDishes(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!payload.restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      const dishes = payload.dishes.map((d: any) => ({
        id: d.id,
        display_order: d.displayOrder
      }));
      await menuRepository.reorderDishes(dishes);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async uploadImage(ws: WSConnection, payload: any) {
    try {
      const { image, restaurantId } = payload;
      const userId = ws.data.userId;

      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!restaurantId) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Restaurant ID required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        restaurantId,
        MEMBER_FLAGS.CAN_EDIT_MENU
      );

      if (!image) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Image data is required' } };
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length === 0) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Invalid image data' } };
      }

      const processedBuffer = await ImageService.transformToWebP(buffer, 500);
      const fileName = `uploads/${userId}-${Date.now()}.webp`;
      const url = await StorageService.uploadFile(fileName, processedBuffer, 'image/webp');

      return { data: { url } };
    } catch (error: any) {
      console.error('[WS] Image upload error:', error);
      const code = error.name === 'AccessDenied' ? 'STORAGE_ACCESS_DENIED' : 'INTERNAL_ERROR';
      return { error: { code: error.code || code, message: error.message || 'Image upload failed' } };
    }
  },

  // Settings Handlers
  async getSettings(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_VIEW_SETTINGS
      );

      const settings = await menuRepository.getSettings(payload.restaurantId);
      if (settings) {
        return { data: {
          ...settings,
          opening_days: JSON.parse(settings.opening_days),
          meal_schedules: JSON.parse(settings.meal_schedules)
        }};
      }
      return { data: null };
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateSettings(ws: WSConnection, payload: any) {
    try {
      const userId = ws.data.userId;
      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      await PermissionService.requirePermissions(
        userId,
        payload.restaurantId,
        MEMBER_FLAGS.CAN_EDIT_SETTINGS
      );

      const { restaurantId, ...update } = payload;
      const dbUpdate: any = {};
      if (update.openingDays) dbUpdate.opening_days = JSON.stringify(update.openingDays);
      if (update.mealSchedules) dbUpdate.meal_schedules = JSON.stringify(update.mealSchedules);
      
      const settings = await menuRepository.upsertSettings(restaurantId, dbUpdate);
      return { data: {
        ...settings,
        opening_days: JSON.parse(settings.opening_days),
        meal_schedules: JSON.parse(settings.meal_schedules)
      }};
    } catch (error: any) {
      return { error: { code: error.code || 'INTERNAL_ERROR', message: error.message } };
    }
  }
};
