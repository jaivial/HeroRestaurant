import { MembershipRepository } from '../repositories/membership.repository';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { Errors } from '../utils/errors';
import { DEFAULT_MEMBER_FLAGS } from '../constants/permissions';
import type { Membership, MembershipUpdate } from '../types/database.types';

interface InviteMemberInput {
  email: string;
  roleId?: string;
}

interface UpdateMemberInput {
  roleId?: string;
  accessFlags?: string;
  status?: 'active' | 'suspended';
}

export class MembershipService {
  /**
   * Gets a user's membership for a specific restaurant
   */
  static async getMembership(userId: string, restaurantId: string): Promise<any | null> {
    return await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
  }

  /**
   * Lists all members of a restaurant
   */
  static async listMembers(restaurantId: string): Promise<any[]> {
    return await MembershipRepository.findByRestaurantId(restaurantId);
  }

  /**
   * Invites a user to a restaurant by email
   */
  static async inviteMember(
    restaurantId: string,
    input: InviteMemberInput,
    invitedByUserId: string
  ): Promise<Membership> {
    // Check requester priority
    const requester = await MembershipRepository.findByUserAndRestaurant(invitedByUserId, restaurantId);
    if (!requester) throw Errors.FORBIDDEN;

    // If roleId is provided, check if it's lower priority than requester
    if (input.roleId) {
      const targetRole = await RoleRepository.findById(input.roleId);
      if (!targetRole) throw Errors.NOT_FOUND('Role');
      if (targetRole.display_order >= requester.role_priority) {
        throw Errors.FORBIDDEN_CUSTOM('Cannot invite with a role higher than or equal to your own');
      }
    }

    // Find user by email
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
      throw Errors.NOT_FOUND('User with this email');
    }

    // Check if already a member
    const existingMembership = await MembershipRepository.findByUserAndRestaurant(user.id, restaurantId);
    if (existingMembership) {
      throw Errors.CONFLICT('User is already a member');
    }

    // Create membership
    return await MembershipRepository.create({
      user_id: user.id,
      restaurant_id: restaurantId,
      role_id: input.roleId || null,
      access_flags: DEFAULT_MEMBER_FLAGS,
      display_name: null,
      invited_by_user_id: invitedByUserId,
      invitation_accepted_at: null,
      status: 'pending',
      last_active_at: null,
      deleted_at: null,
    });
  }

  /**
   * Updates a member's details
   */
  static async updateMember(
    restaurantId: string,
    userId: string,
    input: UpdateMemberInput,
    requesterUserId: string
  ): Promise<Membership> {
    const requester = await MembershipRepository.findByUserAndRestaurant(requesterUserId, restaurantId);
    if (!requester) throw Errors.FORBIDDEN;

    const targetMembership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!targetMembership) {
      throw Errors.NOT_FOUND('Membership');
    }

    // Cannot edit yourself
    if (userId === requesterUserId) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot edit your own workspace membership');
    }

    // Cannot edit someone with higher or equal priority
    if (targetMembership.role_priority >= requester.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot edit a member with higher or equal priority than your own');
    }

    const updateData: MembershipUpdate = {};

    if (input.roleId !== undefined) {
      const targetRole = await RoleRepository.findById(input.roleId);
      if (!targetRole) throw Errors.NOT_FOUND('Role');
      if (targetRole.display_order >= requester.role_priority) {
        throw Errors.FORBIDDEN_CUSTOM('Cannot assign a role with higher or equal priority than your own');
      }
      updateData.role_id = input.roleId;
    }

    if (input.accessFlags !== undefined) updateData.access_flags = BigInt(input.accessFlags);
    if (input.status !== undefined) updateData.status = input.status;

    return await MembershipRepository.update(targetMembership.id, updateData);
  }

  /**
   * Removes a member from a restaurant
   */
  static async removeMember(
    restaurantId: string, 
    userId: string,
    requesterUserId: string
  ): Promise<void> {
    const requester = await MembershipRepository.findByUserAndRestaurant(requesterUserId, restaurantId);
    if (!requester) throw Errors.FORBIDDEN;

    const targetMembership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!targetMembership) {
      throw Errors.NOT_FOUND('Membership');
    }

    // Cannot remove yourself
    if (userId === requesterUserId) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot remove yourself from the workspace');
    }

    // Cannot remove someone with higher or equal priority
    if (targetMembership.role_priority >= requester.role_priority) {
      throw Errors.FORBIDDEN_CUSTOM('Cannot remove a member with higher or equal priority than your own');
    }

    await MembershipRepository.softDelete(targetMembership.id);
  }
}
