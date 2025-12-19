import type { WSConnection } from '../state/connections';
import { UserService } from '../../services/user.service';
import { toUserWithFlags, toUserProfile } from '../../utils/transformers';
import type { UserUpdatePayload } from '../../types/websocket.types';

type HandlerResult = Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;

export const userHandlers = {
  /**
   * Get current user profile
   */
  async get(ws: WSConnection): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    try {
      const user = await UserService.getById(userId);

      return {
        data: {
          user: toUserProfile(user),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to get user profile',
        },
      };
    }
  },

  /**
   * Update current user profile
   */
  async update(ws: WSConnection, payload: unknown): HandlerResult {
    const { userId } = ws.data;

    if (!userId) {
      return {
        error: {
          code: 'WS_NOT_AUTHENTICATED',
          message: 'Not authenticated',
        },
      };
    }

    const { name, avatarUrl, phone } = payload as UserUpdatePayload;

    try {
      const user = await UserService.update(userId, {
        name,
        avatar_url: avatarUrl,
        phone,
      });

      return {
        data: {
          user: toUserWithFlags(user),
        },
      };
    } catch (error: any) {
      return {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to update user profile',
        },
      };
    }
  },
};
