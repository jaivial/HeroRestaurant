import { MembershipRepository } from '../repositories/membership.repository';
import { hasPermission, hasAnyPermission } from '../constants/permissions';
import { Errors } from '../utils/errors';
import type { Membership } from '../types/database.types';

export class PermissionService {
  /**
   * Checks if a user has a global permission
   */
  static hasGlobalPermission(globalFlags: bigint, requiredFlag: bigint): boolean {
    return hasPermission(globalFlags, requiredFlag);
  }

  /**
   * Checks if a member has a specific permission
   */
  static hasMemberPermission(accessFlags: bigint, requiredFlag: bigint): boolean {
    return hasPermission(accessFlags, requiredFlag);
  }

  /**
   * Gets a user's membership for a specific restaurant
   */
  static async getMembership(userId: string, restaurantId: string): Promise<Membership> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      throw Errors.RESTAURANT_ACCESS_DENIED;
    }
    return membership;
  }

  /**
   * Checks if a user has specific permissions in a restaurant
   */
  static async checkPermissions(
    userId: string,
    restaurantId: string,
    requiredPermissions: bigint
  ): Promise<boolean> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      return false;
    }

    return hasPermission(membership.access_flags, requiredPermissions);
  }

  /**
   * Checks if a user has any of the specified permissions in a restaurant
   */
  static async checkAnyPermission(
    userId: string,
    restaurantId: string,
    possiblePermissions: bigint
  ): Promise<boolean> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      return false;
    }

    return hasAnyPermission(membership.access_flags, possiblePermissions);
  }

  /**
   * Requires that a user has specific permissions, throws error if not
   */
  static async requirePermissions(
    userId: string,
    restaurantId: string,
    requiredPermissions: bigint
  ): Promise<Membership> {
    const membership = await this.getMembership(userId, restaurantId);

    if (!hasPermission(membership.access_flags, requiredPermissions)) {
      throw Errors.PERMISSION_DENIED;
    }

    return membership;
  }

  /**
   * Gets all active memberships for a user
   */
  static async getUserMemberships(userId: string): Promise<Membership[]> {
    return await MembershipRepository.findByUserId(userId);
  }

  /**
   * Gets all members of a restaurant
   */
  static async getRestaurantMembers(restaurantId: string): Promise<Membership[]> {
    return await MembershipRepository.findByRestaurantId(restaurantId);
  }
}
