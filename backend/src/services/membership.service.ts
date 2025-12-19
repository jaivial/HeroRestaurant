import { MembershipRepository } from '../repositories/membership.repository';
import { UserRepository } from '../repositories/user.repository';
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
  static async getMembership(userId: string, restaurantId: string): Promise<Membership | null> {
    return await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
  }

  /**
   * Lists all members of a restaurant
   */
  static async listMembers(restaurantId: string): Promise<Membership[]> {
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
    input: UpdateMemberInput
  ): Promise<Membership> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      throw Errors.NOT_FOUND('Membership');
    }

    const updateData: MembershipUpdate = {};

    if (input.roleId !== undefined) updateData.role_id = input.roleId;
    if (input.accessFlags !== undefined) updateData.access_flags = BigInt(input.accessFlags);
    if (input.status !== undefined) updateData.status = input.status;

    return await MembershipRepository.update(membership.id, updateData);
  }

  /**
   * Removes a member from a restaurant
   */
  static async removeMember(restaurantId: string, userId: string): Promise<void> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) {
      throw Errors.NOT_FOUND('Membership');
    }

    await MembershipRepository.softDelete(membership.id);
  }
}
