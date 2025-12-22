import { InvitationRepository } from '../repositories/invitation.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { UserRepository } from '../repositories/user.repository';
import { Errors } from '../utils/errors';
import { DEFAULT_MEMBER_FLAGS } from '../constants/permissions';
import type { Invitation } from '../types/database.types';
import crypto from 'crypto';

export interface CreateInvitationInput {
  restaurantId: string;
  roleId?: string;
  email?: string;
  expiresInDays?: number;
}

export class InvitationService {
  /**
   * Creates a new invitation token
   */
  static async createInvitation(
    input: CreateInvitationInput,
    inviterUserId: string
  ): Promise<Invitation> {
    // Verify restaurant exists
    const restaurant = await RestaurantRepository.findById(input.restaurantId);
    if (!restaurant) throw Errors.NOT_FOUND('Restaurant');

    // Verify inviter has permission
    const inviterMembership = await MembershipRepository.findByUserAndRestaurant(
      inviterUserId,
      input.restaurantId
    );
    if (!inviterMembership) throw Errors.FORBIDDEN;

    // Verify role priority if provided
    if (input.roleId) {
      const targetRole = await RoleRepository.findById(input.roleId);
      if (!targetRole) throw Errors.NOT_FOUND('Role');
      if (targetRole.display_order >= inviterMembership.role_priority) {
        throw Errors.FORBIDDEN_CUSTOM('Cannot invite with a role higher than or equal to your own');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

    return await InvitationRepository.create({
      restaurant_id: input.restaurantId,
      role_id: input.roleId || null,
      inviter_id: inviterUserId,
      email: input.email || null,
      token,
      expires_at: expiresAt,
      status: 'pending',
      used_at: null,
      deleted_at: null,
    });
  }

  /**
   * Validates an invitation token and returns its details
   */
  static async validateInvitation(token: string): Promise<any> {
    const invitation = await InvitationRepository.findByToken(token);
    if (!invitation) throw Errors.NOT_FOUND('Invitation');

    if (invitation.status !== 'pending') {
      throw Errors.FORBIDDEN_CUSTOM('This invitation has already been used or is invalid');
    }

    if (new Date() > invitation.expires_at) {
      await InvitationRepository.update(invitation.id, { status: 'expired' });
      throw Errors.FORBIDDEN_CUSTOM('This invitation has expired');
    }

    const restaurant = await RestaurantRepository.findById(invitation.restaurant_id);
    const inviter = await UserRepository.findById(invitation.inviter_id);
    const role = invitation.role_id ? await RoleRepository.findById(invitation.role_id) : null;

    return {
      id: invitation.id,
      restaurant: {
        id: restaurant?.id,
        name: restaurant?.name,
        logoUrl: restaurant?.logo_url,
      },
      inviter: {
        name: inviter?.name,
      },
      role: role ? {
        name: role.name,
        color: role.color,
      } : null,
      expiresAt: invitation.expires_at,
    };
  }

  /**
   * Accepts an invitation and joins the workspace
   */
  static async acceptInvitation(token: string, userId: string): Promise<string> {
    const invitation = await InvitationRepository.findByToken(token);
    if (!invitation) throw Errors.NOT_FOUND('Invitation');

    if (invitation.status !== 'pending' || new Date() > invitation.expires_at) {
      throw Errors.FORBIDDEN_CUSTOM('Invalid or expired invitation');
    }

    // Check if user is already a member
    const existingMembership = await MembershipRepository.findByUserAndRestaurant(
      userId,
      invitation.restaurant_id
    );
    if (existingMembership) {
      // Mark invitation as used anyway if they are already in
      await InvitationRepository.update(invitation.id, {
        status: 'accepted',
        used_at: new Date(),
      });
      return invitation.restaurant_id;
    }

    // Atomic-like update (could use transaction but for simplicity and Bun/Kysely speed)
    await db.transaction().execute(async (trx) => {
      // Create membership
      const membershipId = crypto.randomUUID();
      const now = new Date();
      await trx
        .insertInto('memberships')
        .values({
          id: membershipId,
          user_id: userId,
          restaurant_id: invitation.restaurant_id,
          role_id: invitation.role_id,
          access_flags: DEFAULT_MEMBER_FLAGS,
          invited_by_user_id: invitation.inviter_id,
          invitation_accepted_at: now,
          status: 'active',
          joined_at: now,
          created_at: now,
          updated_at: now,
        })
        .execute();

      // Mark invitation as used
      await trx
        .updateTable('invitations')
        .set({
          status: 'accepted',
          used_at: now,
          updated_at: now,
        })
        .where('id', '=', invitation.id)
        .execute();
    });

    return invitation.restaurant_id;
  }
}

// Helper to access DB directly in transaction if needed
import { db } from '../database/kysely';
