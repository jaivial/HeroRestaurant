import type { Context } from 'hono';
import { MembershipRepository } from '../repositories/membership.repository';
import { UserRepository } from '../repositories/user.repository';
import { success, created } from '../utils/response';
import { Errors } from '../utils/errors';
import type { NewMembership } from '../types/database.types';

export class MembershipHandler {
  /**
   * GET /restaurants/:restaurantId/members
   * List all members of a restaurant
   */
  static async list(c: Context) {
    const restaurantId = c.req.param('restaurantId');
    const memberships = await MembershipRepository.findByRestaurantId(restaurantId);

    // Get user details for each membership
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await UserRepository.findById(membership.user_id);
        return {
          membershipId: membership.id,
          userId: membership.user_id,
          name: user?.name ?? 'Unknown',
          email: user?.email ?? 'Unknown',
          accessFlags: membership.access_flags.toString(),
          status: membership.status,
          joinedAt: membership.joined_at.toISOString(),
          lastActiveAt: membership.last_active_at?.toISOString(),
        };
      })
    );

    return success(c, { members });
  }

  /**
   * POST /restaurants/:restaurantId/members
   * Add a member to restaurant
   */
  static async create(c: Context) {
    const restaurantId = c.req.param('restaurantId');
    const inviterId = c.get('userId') as string;
    const body = await c.req.json<{
      email: string;
      accessFlags: string; // BigInt as string
    }>();

    // Find user by email
    const user = await UserRepository.findByEmail(body.email);
    if (!user) {
      throw Errors.NOT_FOUND('User');
    }

    // Check if already a member
    const existing = await MembershipRepository.findByUserAndRestaurant(user.id, restaurantId);
    if (existing) {
      throw Errors.CONFLICT('User is already a member');
    }

    // Create membership
    const membershipData: NewMembership = {
      user_id: user.id,
      restaurant_id: restaurantId,
      role_id: null,
      access_flags: BigInt(body.accessFlags),
      display_name: null,
      invited_by_user_id: inviterId,
      invitation_accepted_at: new Date(),
      status: 'active',
      last_active_at: new Date(),
      deleted_at: null,
    };

    const membership = await MembershipRepository.create(membershipData);

    return created(c, {
      membership: {
        id: membership.id,
        userId: membership.user_id,
        accessFlags: membership.access_flags.toString(),
        status: membership.status,
        joinedAt: membership.joined_at.toISOString(),
      },
    });
  }

  /**
   * PATCH /restaurants/:restaurantId/members/:userId
   * Update member permissions
   */
  static async update(c: Context) {
    const restaurantId = c.req.param('restaurantId');
    const targetUserId = c.req.param('userId');
    const currentUserId = c.get('userId') as string;
    const body = await c.req.json<{
      accessFlags?: string;
      status?: 'active' | 'suspended';
    }>();

    // Cannot modify own permissions
    if (targetUserId === currentUserId) {
      throw Errors.PERMISSION_DENIED;
    }

    // Get membership
    const membership = await MembershipRepository.findByUserAndRestaurant(targetUserId, restaurantId);
    if (!membership) {
      throw Errors.NOT_FOUND('Membership');
    }

    // Update
    const updates: any = {};
    if (body.accessFlags !== undefined) {
      updates.access_flags = BigInt(body.accessFlags);
    }
    if (body.status !== undefined) {
      updates.status = body.status;
    }

    const updated = await MembershipRepository.update(membership.id, updates);

    return success(c, {
      membership: {
        id: updated.id,
        accessFlags: updated.access_flags.toString(),
        status: updated.status,
        updatedAt: updated.updated_at.toISOString(),
      },
    });
  }

  /**
   * DELETE /restaurants/:restaurantId/members/:userId
   * Remove member from restaurant
   */
  static async delete(c: Context) {
    const restaurantId = c.req.param('restaurantId');
    const targetUserId = c.req.param('userId');
    const currentUserId = c.get('userId') as string;

    // Cannot remove self
    if (targetUserId === currentUserId) {
      throw new Errors.PERMISSION_DENIED.constructor(
        'INVALID_OPERATION',
        'Cannot remove yourself from restaurant',
        400
      );
    }

    // Get membership
    const membership = await MembershipRepository.findByUserAndRestaurant(targetUserId, restaurantId);
    if (!membership) {
      throw Errors.NOT_FOUND('Membership');
    }

    // Check if this is the last owner
    const ownerCount = await MembershipRepository.countOwnersByRestaurant(restaurantId);
    const isOwner = (membership.access_flags & (1n << 22n)) !== 0n; // CAN_DELETE_RESTAURANT

    if (isOwner && ownerCount <= 1) {
      throw new Errors.PERMISSION_DENIED.constructor(
        'INVALID_OPERATION',
        'Cannot remove the last owner',
        400
      );
    }

    await MembershipRepository.softDelete(membership.id);

    return success(c, { message: 'Member removed successfully' });
  }
}
