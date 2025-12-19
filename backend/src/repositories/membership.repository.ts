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
  ): Promise<Membership | null> {
    const membership = await db
      .selectFrom('memberships')
      .selectAll()
      .where('user_id', '=', userId)
      .where('restaurant_id', '=', restaurantId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .executeTakeFirst();

    return membership ?? null;
  }

  static async findByUserId(userId: string): Promise<Membership[]> {
    return await db
      .selectFrom('memberships')
      .selectAll()
      .where('user_id', '=', userId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .orderBy('joined_at', 'desc')
      .execute();
  }

  static async findByRestaurantId(restaurantId: string): Promise<Membership[]> {
    return await db
      .selectFrom('memberships')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .orderBy('joined_at', 'desc')
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
    const OWNER_FLAG = 1n << 22n; // CAN_DELETE_RESTAURANT

    const result = await db
      .selectFrom('memberships')
      .select(({ fn }) => [fn.countAll().as('count')])
      .where('restaurant_id', '=', restaurantId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .where(({ eb, and }) =>
        and([
          eb('access_flags', '&', OWNER_FLAG.toString()),
          eb('access_flags', '!=', '0'),
        ])
      )
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }
}
