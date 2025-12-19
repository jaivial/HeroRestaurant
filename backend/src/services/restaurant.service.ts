import { RestaurantRepository } from '../repositories/restaurant.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { Errors } from '../utils/errors';
import { ROLE_OWNER } from '../constants/permissions';
import type { Restaurant, NewRestaurant, RestaurantUpdate } from '../types/database.types';

interface CreateRestaurantInput {
  name: string;
  slug?: string;
  description?: string;
  timezone?: string;
  currency?: string;
}

interface UpdateRestaurantInput {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  timezone?: string;
  currency?: string;
}

export class RestaurantService {
  /**
   * Creates a new restaurant and adds the creator as owner
   */
  static async create(userId: string, input: CreateRestaurantInput): Promise<Restaurant> {
    // Generate slug if not provided
    const slug = input.slug || this.generateSlug(input.name);

    // Check if slug is available
    const existingRestaurant = await RestaurantRepository.findBySlug(slug);
    if (existingRestaurant) {
      throw Errors.CONFLICT('Restaurant slug already exists');
    }

    // Create restaurant
    const restaurant = await RestaurantRepository.create({
      name: input.name,
      slug,
      description: input.description || null,
      logo_url: null,
      cover_image_url: null,
      timezone: input.timezone || 'UTC',
      currency: input.currency || 'USD',
      feature_flags: 0n,
      owner_user_id: userId,
      status: 'trial',
      trial_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      deleted_at: null,
    });

    // Add creator as owner member
    await MembershipRepository.create({
      user_id: userId,
      restaurant_id: restaurant.id,
      role_id: null,
      access_flags: ROLE_OWNER,
      display_name: null,
      invited_by_user_id: null,
      invitation_accepted_at: new Date(),
      status: 'active',
      last_active_at: new Date(),
      deleted_at: null,
    });

    return restaurant;
  }

  /**
   * Lists all restaurants a user has access to
   */
  static async listForUser(userId: string): Promise<Restaurant[]> {
    return await RestaurantRepository.findByUserId(userId);
  }

  /**
   * Gets a restaurant by ID, verifying user access
   */
  static async getById(restaurantId: string, userId: string): Promise<Restaurant> {
    const restaurant = await RestaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw Errors.NOT_FOUND('Restaurant');
    }

    // Check if user has access
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      throw Errors.RESTAURANT_ACCESS_DENIED;
    }

    return restaurant;
  }

  /**
   * Updates a restaurant
   */
  static async update(restaurantId: string, input: UpdateRestaurantInput): Promise<Restaurant> {
    const updateData: RestaurantUpdate = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
    if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl;
    if (input.timezone !== undefined) updateData.timezone = input.timezone;
    if (input.currency !== undefined) updateData.currency = input.currency;

    return await RestaurantRepository.update(restaurantId, updateData);
  }

  /**
   * Soft deletes a restaurant
   */
  static async delete(restaurantId: string): Promise<void> {
    await RestaurantRepository.softDelete(restaurantId);
  }

  /**
   * Generates a URL-safe slug from a name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);
  }
}
