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
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  primaryColor?: string;
  defaultLanguage?: string;
  defaultTaxRate?: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
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
      description: input.description ?? null,
      logo_url: null,
      cover_url: null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
      timezone: input.timezone || 'UTC',
      currency: input.currency || 'USD',
      website_url: null,
      instagram_url: null,
      facebook_url: null,
      primary_color: '#007AFF',
      default_language: 'en',
      default_tax_rate: 0.00,
      contact_email: null,
      contact_phone: null,
      feature_flags: 0n,
      subscription_tier: 'free',
      owner_user_id: userId,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
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
   * Lists all restaurants a user has access to (as member or owner)
   */
  static async listForUser(userId: string): Promise<Restaurant[]> {
    // Get memberships for user
    const memberships = await MembershipRepository.findByUserId(userId);

    // Get restaurants for those memberships
    const restaurants: Restaurant[] = [];
    for (const membership of memberships) {
      const restaurant = await RestaurantRepository.findById(membership.restaurant_id);
      if (restaurant) {
        restaurants.push(restaurant);
      }
    }

    return restaurants;
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
    if (input.coverImageUrl !== undefined) updateData.cover_url = input.coverImageUrl;
    if (input.timezone !== undefined) updateData.timezone = input.timezone;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
    if (input.instagramUrl !== undefined) updateData.instagram_url = input.instagramUrl;
    if (input.facebookUrl !== undefined) updateData.facebook_url = input.facebookUrl;
    if (input.primaryColor !== undefined) updateData.primary_color = input.primaryColor;
    if (input.defaultLanguage !== undefined) updateData.default_language = input.defaultLanguage;
    if (input.defaultTaxRate !== undefined) updateData.default_tax_rate = input.defaultTaxRate;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.postalCode !== undefined) updateData.postal_code = input.postalCode;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.contactEmail !== undefined) updateData.contact_email = input.contactEmail;
    if (input.contactPhone !== undefined) updateData.contact_phone = input.contactPhone;

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
