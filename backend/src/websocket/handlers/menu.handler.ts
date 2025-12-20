import { menuRepository } from '../../repositories/menu.repository';
import type { WSConnection } from '../state/connections';
import { createErrorResponse, createSuccessResponse } from '../../types/websocket.types';
import { ImageService } from '../../services/image.service';
import { StorageService } from '../../services/storage.service';

export const menuHandlers = {
  async create(ws: WSConnection, payload: any) {
    try {
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
      return { data: menu };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async list(ws: WSConnection, payload: any) {
    try {
      const menus = await menuRepository.listFixedByRestaurant(payload.restaurantId);
      // Parse JSON fields and normalize booleans for SQLite
      const parsedMenus = menus.map(m => ({
        ...m,
        isActive: !!m.is_active,
        drinkIncluded: !!m.drink_included,
        coffeeIncluded: !!m.coffee_included,
        availability: m.availability ? JSON.parse(m.availability) : { breakfast: [], lunch: [], dinner: [] }
      }));
      return { data: parsedMenus };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async update(ws: WSConnection, payload: any) {
    try {
      const { menuId, ...update } = payload;
      const dbUpdate: any = { ...update };
      
      if (update.availability) {
        dbUpdate.availability = JSON.stringify(update.availability);
      }
      if (update.drinkIncluded !== undefined) dbUpdate.drink_included = update.drinkIncluded;
      if (update.coffeeIncluded !== undefined) dbUpdate.coffee_included = update.coffeeIncluded;
      if (update.isActive !== undefined) dbUpdate.is_active = update.isActive;

      await menuRepository.updateFixed(menuId, dbUpdate);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async delete(ws: WSConnection, payload: any) {
    try {
      await menuRepository.deleteFixed(payload.menuId);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  // Section Handlers
  async createSection(ws: WSConnection, payload: any) {
    try {
      const section = await menuRepository.createSection({
        name: payload.name,
        fixed_menu_id: payload.menuType === 'fixed' ? payload.menuId : null,
        open_menu_id: payload.menuType === 'open' ? payload.menuId : null,
        display_order: payload.displayOrder || 0
      });
      return { data: section };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  // Dish Handlers
  async createDish(ws: WSConnection, payload: any) {
    try {
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
      return { data: dish };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateDish(ws: WSConnection, payload: any) {
    try {
      const { dishId, ...update } = payload;
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
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async deleteDish(ws: WSConnection, payload: any) {
    try {
      await menuRepository.deleteDish(payload.dishId);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async reorderDishes(ws: WSConnection, payload: any) {
    try {
      const dishes = payload.dishes.map((d: any) => ({
        id: d.id,
        display_order: d.displayOrder
      }));
      await menuRepository.reorderDishes(dishes);
      return { data: { success: true } };
    } catch (error: any) {
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async uploadImage(ws: WSConnection, payload: any) {
    try {
      const { image, fileName: originalFileName, contentType: originalContentType } = payload;
      const userId = ws.data.userId;

      if (!userId) {
        return { error: { code: 'WS_NOT_AUTHENTICATED', message: 'Authentication required' } };
      }

      if (!image) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Image data is required' } };
      }

      // Convert base64 to buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length === 0) {
        return { error: { code: 'VALIDATION_ERROR', message: 'Invalid image data' } };
      }

      // Transform to WebP and optimize (max 500KB)
      const processedBuffer = await ImageService.transformToWebP(buffer, 500);

      // Generate a unique filename
      const fileName = `uploads/${userId}-${Date.now()}.webp`;

      // Upload to R2
      const url = await StorageService.uploadFile(fileName, processedBuffer, 'image/webp');

      return { data: { url } };
    } catch (error: any) {
      console.error('[WS] Image upload error:', error);
      // Map S3/R2 Access Denied to a more specific error if needed, 
      // but for now let's just ensure we see the message.
      const code = error.name === 'AccessDenied' ? 'STORAGE_ACCESS_DENIED' : 'INTERNAL_ERROR';
      return { error: { code, message: error.message || 'Image upload failed' } };
    }
  },

  // Settings Handlers
  async getSettings(ws: WSConnection, payload: any) {
    try {
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
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  },

  async updateSettings(ws: WSConnection, payload: any) {
    try {
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
      return { error: { code: 'INTERNAL_ERROR', message: error.message } };
    }
  }
};
