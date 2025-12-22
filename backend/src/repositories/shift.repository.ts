import { sql } from 'kysely';
import { db } from '../database/kysely';
import type { 
  MemberShift, 
  NewMemberShift, 
  MemberShiftUpdate,
  MemberContract,
  NewMemberContract
} from '../types/database.types';

export class ShiftRepository {
  // --- Shifts ---

  static async findShiftById(id: string): Promise<MemberShift | null> {
    const shift = await db
      .selectFrom('member_shifts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return shift ?? null;
  }

  static async findActiveShift(membershipId: string): Promise<MemberShift | null> {
    const shift = await db
      .selectFrom('member_shifts')
      .selectAll()
      .where('membership_id', '=', membershipId)
      .where('punch_out_at', 'is', null)
      .orderBy('punch_in_at', 'desc')
      .executeTakeFirst();

    return shift ?? null;
  }

  static async createShift(data: NewMemberShift): Promise<MemberShift> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('member_shifts')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const shift = await this.findShiftById(id);
    if (!shift) throw new Error('Failed to create shift');
    return shift;
  }

  static async updateShift(id: string, data: MemberShiftUpdate): Promise<MemberShift> {
    await db
      .updateTable('member_shifts')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const shift = await this.findShiftById(id);
    if (!shift) throw new Error('Shift not found after update');
    return shift;
  }

  static async findShiftsByMembership(
    membershipId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<MemberShift[]> {
    return await db
      .selectFrom('member_shifts')
      .selectAll()
      .where('membership_id', '=', membershipId)
      .where('punch_in_at', '>=', startDate)
      .where('punch_in_at', '<=', endDate)
      .orderBy('punch_in_at', 'desc')
      .execute();
  }

  // --- Contracts ---

  static async findContractById(id: string): Promise<MemberContract | null> {
    const contract = await db
      .selectFrom('member_contracts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return contract ?? null;
  }

  static async findActiveContract(membershipId: string, date: Date = new Date()): Promise<MemberContract | null> {
    const contract = await db
      .selectFrom('member_contracts')
      .selectAll()
      .where('membership_id', '=', membershipId)
      .where('effective_from', '<=', date)
      .where((eb) => eb.or([
        eb('effective_to', 'is', null),
        eb('effective_to', '>=', date)
      ]))
      .orderBy('effective_from', 'desc')
      .executeTakeFirst();

    return contract ?? null;
  }

  static async createContract(data: NewMemberContract): Promise<MemberContract> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('member_contracts')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const contract = await this.findContractById(id);
    if (!contract) throw new Error('Failed to create contract');
    return contract;
  }

  // --- Stats Aggregation ---

  static async getMemberStats(restaurantId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await db
      .selectFrom('memberships')
      .innerJoin('users', 'users.id', 'memberships.user_id')
      .leftJoin('member_contracts', (join) => 
        join.onRef('member_contracts.membership_id', '=', 'memberships.id')
          .on('member_contracts.effective_from', '<=', endDate)
          .on((eb) => eb.or([
            eb('member_contracts.effective_to', 'is', null),
            eb('member_contracts.effective_to', '>=', startDate)
          ]))
      )
      .select([
        'memberships.id',
        'users.name',
        'users.email',
        'member_contracts.weekly_hours',
        (eb) => eb
          .selectFrom('member_shifts')
          .select((eb) => eb.fn.sum(eb.fn.coalesce('total_minutes', eb.val(0))).as('sum'))
          .whereRef('membership_id', '=', 'memberships.id')
          .where('punch_in_at', '>=', startDate)
          .where('punch_in_at', '<=', endDate)
          .as('total_worked_minutes')
      ])
      .where('memberships.restaurant_id', '=', restaurantId)
      .where('memberships.deleted_at', 'is', null)
      .groupBy(['memberships.id', 'users.name', 'users.email', 'member_contracts.weekly_hours'])
      .execute();
  }
}

