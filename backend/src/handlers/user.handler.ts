import type { Context } from 'hono';
import { UserService } from '../services/user.service';
import { success } from '../utils/response';
import type { User, UserUpdate } from '../types/database.types';

export class UserHandler {
  /**
   * GET /users/me
   * Get current user profile with restaurants
   */
  static async getMe(c: Context) {
    const userId = c.get('userId') as string;
    const user = await UserService.getById(userId);
    const restaurants = await UserService.getUserRestaurants(userId);

    return success(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        memberFlags: user.member_flags.toString(),
        status: user.status,
        emailVerifiedAt: user.email_verified_at?.toISOString(),
        lastLoginAt: user.last_login_at?.toISOString(),
        createdAt: user.created_at.toISOString(),
      },
      restaurants: restaurants.map((membership) => ({
        membershipId: membership.id,
        restaurantId: membership.restaurant_id,
        accessFlags: membership.access_flags.toString(),
        status: membership.status,
        joinedAt: membership.joined_at.toISOString(),
      })),
    });
  }

  /**
   * PATCH /users/me
   * Update current user profile
   */
  static async updateMe(c: Context) {
    const userId = c.get('userId') as string;
    const body = await c.req.json<Partial<UserUpdate>>();

    // Only allow updating certain fields
    const allowedFields: Partial<UserUpdate> = {};
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.avatar_url !== undefined) allowedFields.avatar_url = body.avatar_url;

    const user = await UserService.update(userId, allowedFields);

    return success(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
      },
    });
  }
}
