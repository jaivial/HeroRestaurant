import type { Context } from 'hono';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { success, created } from '../utils/response';
import { Errors } from '../utils/errors';
import { DEFAULT_RESTAURANT_FLAGS, ROLE_TEMPLATES } from '../constants/permissions';
import type { NewRestaurant, RestaurantUpdate } from '../types/database.types';

export class RestaurantHandler {
  /**
   * POST /restaurants
   * Create a new restaurant
   */
  static async create(c: Context) {
    const userId = c.get('userId') as string;
    const body = await c.req.json<{
      name: string;
      slug: string;
      description?: string;
      timezone?: string;
      currency?: string;
    }>();

    // Check if slug is available
    const slugExists = await RestaurantRepository.checkSlugExists(body.slug);
    if (slugExists) {
      throw Errors.CONFLICT('Restaurant slug already taken');
    }

    // Create restaurant
    const restaurantData: NewRestaurant = {
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      logo_url: null,
      cover_image_url: null,
      address: null,
      timezone: body.timezone ?? 'UTC',
      currency: body.currency ?? 'USD',
      contact_email: null,
      contact_phone: null,
      feature_flags: DEFAULT_RESTAURANT_FLAGS,
      owner_user_id: userId,
      status: 'active',
      trial_expires_at: null,
      deleted_at: null,
    };

    const restaurant = await RestaurantRepository.create(restaurantData);

    // Create owner membership
    await MembershipRepository.create({
      user_id: userId,
      restaurant_id: restaurant.id,
      role_id: null,
      access_flags: ROLE_TEMPLATES.OWNER,
      display_name: null,
      invited_by_user_id: null,
      invitation_accepted_at: new Date(),
      status: 'active',
      last_active_at: new Date(),
      deleted_at: null,
    });

    return created(c, {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        timezone: restaurant.timezone,
        currency: restaurant.currency,
        status: restaurant.status,
        createdAt: restaurant.created_at.toISOString(),
      },
    });
  }

  /**
   * GET /restaurants
   * List restaurants user belongs to
   */
  static async list(c: Context) {
    const userId = c.get('userId') as string;
    const memberships = await MembershipRepository.findByUserId(userId);

    const restaurantIds = memberships.map((m) => m.restaurant_id);
    const restaurants = await Promise.all(
      restaurantIds.map((id) => RestaurantRepository.findById(id))
    );

    const result = restaurants
      .filter((r) => r !== null)
      .map((restaurant, index) => ({
        id: restaurant!.id,
        name: restaurant!.name,
        slug: restaurant!.slug,
        logoUrl: restaurant!.logo_url,
        status: restaurant!.status,
        accessFlags: memberships[index].access_flags.toString(),
        membershipStatus: memberships[index].status,
        joinedAt: memberships[index].joined_at.toISOString(),
      }));

    return success(c, { restaurants: result });
  }

  /**
   * GET /restaurants/:id
   * Get restaurant details
   */
  static async getById(c: Context) {
    const restaurantId = c.req.param('id');
    const restaurant = await RestaurantRepository.findById(restaurantId);

    if (!restaurant) {
      throw Errors.NOT_FOUND('Restaurant');
    }

    return success(c, {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        logoUrl: restaurant.logo_url,
        coverImageUrl: restaurant.cover_image_url,
        address: restaurant.address,
        timezone: restaurant.timezone,
        currency: restaurant.currency,
        contactEmail: restaurant.contact_email,
        contactPhone: restaurant.contact_phone,
        featureFlags: restaurant.feature_flags.toString(),
        status: restaurant.status,
        createdAt: restaurant.created_at.toISOString(),
      },
    });
  }

  /**
   * PATCH /restaurants/:id
   * Update restaurant settings
   */
  static async update(c: Context) {
    const restaurantId = c.req.param('id');
    const body = await c.req.json<Partial<RestaurantUpdate>>();

    // If updating slug, check availability
    if (body.slug) {
      const slugExists = await RestaurantRepository.checkSlugExists(body.slug, restaurantId);
      if (slugExists) {
        throw Errors.CONFLICT('Restaurant slug already taken');
      }
    }

    const restaurant = await RestaurantRepository.update(restaurantId, body);

    return success(c, {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        timezone: restaurant.timezone,
        currency: restaurant.currency,
        updatedAt: restaurant.updated_at.toISOString(),
      },
    });
  }

  /**
   * DELETE /restaurants/:id
   * Soft delete restaurant
   */
  static async delete(c: Context) {
    const restaurantId = c.req.param('id');
    await RestaurantRepository.softDelete(restaurantId);

    return success(c, { message: 'Restaurant deleted successfully' });
  }
}
