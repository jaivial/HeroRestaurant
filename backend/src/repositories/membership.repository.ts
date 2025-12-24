import { sql } from 'kysely';
import { db } from '../database/kysely';
import type { Membership, NewMembership, MembershipUpdate } from '../types/database.types';

export class MembershipRepository {
  static async findById(id: string): Promise<Membership | null> {
    const membership = await db
      .selectFrom('memberships')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return membership ?? null;
  }

  static async findByUserAndRestaurant(
    userId: string,
    restaurantId: string
  ): Promise<(Membership & { role_priority: number }) | null> {
    const membership = await db
      .selectFrom('memberships')
      .leftJoin('roles', 'roles.id', 'memberships.role_id')
      .select([
        'memberships.id',
        'memberships.user_id',
        'memberships.restaurant_id',
        'memberships.role_id',
        'memberships.access_flags',
        'memberships.display_name',
        'memberships.joined_at',
        'memberships.invited_by_user_id',
        'memberships.invitation_accepted_at',
        'memberships.status',
        'memberships.last_active_at',
        'memberships.created_at',
        'memberships.updated_at',
        'memberships.deleted_at',
        sql<number>`GREATEST(COALESCE(roles.display_order, 0), CASE WHEN memberships.access_flags & ${sql.raw((1n << 27n).toString())} != 0 THEN 100 ELSE 0 END)`.as('role_priority')
      ])
      .where('memberships.user_id', '=', userId)
      .where('memberships.restaurant_id', '=', restaurantId)
      .where('memberships.deleted_at', 'is', null)
      .executeTakeFirst();

    return (membership as any) ?? null;
  }

  static async findByUserId(userId: string): Promise<any[]> {
    return await db
      .selectFrom('memberships')
      .leftJoin('roles', 'roles.id', 'memberships.role_id')
      .select([
        'memberships.id',
        'memberships.user_id',
        'memberships.restaurant_id',
        'memberships.role_id',
        'memberships.access_flags',
        'memberships.display_name',
        'memberships.status',
        'memberships.joined_at',
        'memberships.last_active_at',
        sql<number>`GREATEST(COALESCE(roles.display_order, 0), CASE WHEN memberships.access_flags & ${sql.raw((1n << 27n).toString())} != 0 THEN 100 ELSE 0 END)`.as('role_priority')
      ])
      .where('memberships.user_id', '=', userId)
      .where('memberships.deleted_at', 'is', null)
      .orderBy('memberships.joined_at', 'desc')
      .execute();
  }

  static async findByRestaurantId(restaurantId: string): Promise<any[]> {
    return await db
      .selectFrom('memberships')
      .innerJoin('users', 'users.id', 'memberships.user_id')
      .leftJoin('roles', 'roles.id', 'memberships.role_id')
      .select([
        'memberships.id',
        'memberships.user_id',
        'memberships.restaurant_id',
        'memberships.role_id',
        'memberships.access_flags',
        'memberships.display_name',
        'memberships.status',
        'memberships.joined_at',
        'memberships.last_active_at',
        'users.name as user_name',
        'users.email as user_email',
        'users.avatar_url as user_avatar_url',
        'roles.name as role_name',
        'roles.color as role_color',
        sql<number>`GREATEST(COALESCE(roles.display_order, 0), CASE WHEN memberships.access_flags & ${sql.raw((1n << 27n).toString())} != 0 THEN 100 ELSE 0 END)`.as('role_priority')
      ])
      .where('memberships.restaurant_id', '=', restaurantId)
      .where('memberships.deleted_at', 'is', null)
      .orderBy('role_priority', 'desc')
      .orderBy('memberships.joined_at', 'desc')
      .execute();
  }

  static async create(data: NewMembership): Promise<Membership> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('memberships')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
        joined_at: now,
      })
      .execute();

    const membership = await this.findById(id);
    if (!membership) {
      throw new Error('Failed to create membership');
    }

    return membership;
  }

  static async update(id: string, data: MembershipUpdate): Promise<Membership> {
    await db
      .updateTable('memberships')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const membership = await this.findById(id);
    if (!membership) {
      throw new Error('Membership not found after update');
    }

    return membership;
  }

  static async updateLastActive(id: string): Promise<void> {
    await db
      .updateTable('memberships')
      .set({ last_active_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('memberships')
      .set({
        deleted_at: new Date(),
        status: 'left',
      })
      .where('id', '=', id)
      .execute();
  }

  static async countOwnersByRestaurant(restaurantId: string): Promise<number> {
    // Assuming owner role has CAN_DELETE_RESTAURANT permission
    // Use raw SQL for bitwise operations on bigint
    const OWNER_FLAG = 1n << 27n; // CAN_DELETE_RESTAURANT (bit 27)

    const result = await db
      .selectFrom('memberships')
      .select(({ fn }) => [fn.countAll().as('count')])
      .where('restaurant_id', '=', restaurantId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .where(sql<boolean>`access_flags & ${OWNER_FLAG.toString()} != 0`)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }
}
