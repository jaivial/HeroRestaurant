import type { WSConnection } from '../state/connections';
import { PreferenceService } from '../../services/preference.service';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const preferenceHandlers = {
  /**
   * Get all preferences for user and workspace
   */
  async get(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    const { restaurantId } = payload;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const preferences = await PreferenceService.getAll(userId, restaurantId);

      return {
        data: {
          preferences,
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get preferences',
        },
      };
    }
  },

  /**
   * Set a preference
   */
  async set(ws: WSConnection, payload: any): HandlerResult {
    const { userId } = ws.data;
    const { restaurantId, key, value } = payload;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      await PreferenceService.set(userId, restaurantId, key, value);

      return {
        data: {
          success: true,
          key,
          value,
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to set preference',
        },
      };
    }
  },
};
