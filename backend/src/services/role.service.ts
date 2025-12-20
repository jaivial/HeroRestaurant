import { RoleRepository } from '../repositories/role.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { Errors } from '../utils/errors';
import type { Role, NewRole, RoleUpdate } from '../types/database.types';

export class RoleService {
  /**
   * Lists all roles for a restaurant, including system roles
   */
  static async listRoles(restaurantId: string): Promise<Role[]> {
    return await RoleRepository.findByRestaurantId(restaurantId);
  }

  /**
   * Creates a new custom role for a restaurant
   */
  static async createRole(
    restaurantId: string,
    data: Omit<NewRole, 'restaurant_id' | 'is_system_role'>,
    requesterUserId: string
  ): Promise<Role> {
    // Check requester priority
    const requesterMembership = await MembershipRepository.findByUserAndRestaurant(requesterUserId, restaurantId);
    if (!requesterMembership) throw Errors.FORBIDDEN;

    // A user cannot create a role with priority higher than or equal to their own
    if (data.display_order >= requesterMembership.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot create a role with priority higher than or equal to your own');
    }

    return await RoleRepository.create({
      ...data,
      restaurant_id: restaurantId,
      is_system_role: false,
    });
  }

  /**
   * Updates an existing role
   */
  static async updateRole(
    restaurantId: string,
    roleId: string,
    data: RoleUpdate,
    requesterUserId: string
  ): Promise<Role> {
    const role = await RoleRepository.findById(roleId);
    if (!role || role.restaurant_id !== restaurantId) {
      throw Errors.NOT_FOUND('Role');
    }

    if (role.is_system_role) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot update system roles');
    }

    // Check requester priority
    const requesterMembership = await MembershipRepository.findByUserAndRestaurant(requesterUserId, restaurantId);
    if (!requesterMembership) throw Errors.FORBIDDEN;

    // Cannot edit a role that has higher or equal priority to yours
    if (role.display_order >= requesterMembership.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot update a role with priority higher than or equal to your own');
    }

    // Cannot change priority to something higher than or equal to yours
    if (data.display_order !== undefined && data.display_order >= requesterMembership.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot set role priority higher than or equal to your own');
    }

    return await RoleRepository.update(roleId, data);
  }

  /**
   * Deletes a role
   */
  static async deleteRole(
    restaurantId: string,
    roleId: string,
    requesterUserId: string
  ): Promise<void> {
    const role = await RoleRepository.findById(roleId);
    if (!role || role.restaurant_id !== restaurantId) {
      throw Errors.NOT_FOUND('Role');
    }

    if (role.is_system_role) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot delete system roles');
    }

    // Check requester priority
    const requesterMembership = await MembershipRepository.findByUserAndRestaurant(requesterUserId, restaurantId);
    if (!requesterMembership) throw Errors.FORBIDDEN;

    if (role.display_order >= requesterMembership.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot delete a role with priority higher than or equal to your own');
    }

    await RoleRepository.softDelete(roleId);
  }
}

