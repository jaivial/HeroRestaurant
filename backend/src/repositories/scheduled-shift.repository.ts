import { db } from '../database/kysely';
import type { 
  ScheduledShift, 
  NewScheduledShift, 
  ScheduledShiftUpdate 
} from '../types/database.types';

export class ScheduledShiftRepository {
  static async findById(id: string): Promise<ScheduledShift | null> {
    const shift = await db
      .selectFrom('scheduled_shifts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return shift ?? null;
  }

  static async findByMembership(
    membershipId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ScheduledShift[]> {
    return await db
      .selectFrom('scheduled_shifts')
      .selectAll()
      .where('membership_id', '=', membershipId)
      .where('start_at', '>=', startDate)
      .where('start_at', '<=', endDate)
      .orderBy('start_at', 'asc')
      .execute();
  }

  static async create(data: NewScheduledShift): Promise<ScheduledShift> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db
      .insertInto('scheduled_shifts')
      .values({
        id,
        ...data,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const shift = await this.findById(id);
    if (!shift) throw new Error('Failed to create scheduled shift');
    return shift;
  }

  static async update(id: string, data: ScheduledShiftUpdate): Promise<ScheduledShift> {
    await db
      .updateTable('scheduled_shifts')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    const shift = await this.findById(id);
    if (!shift) throw new Error('Scheduled shift not found after update');
    return shift;
  }

  static async delete(id: string): Promise<void> {
    await db
      .deleteFrom('scheduled_shifts')
      .where('id', '=', id)
      .execute();
  }

  static async findByRestaurant(
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return await db
      .selectFrom('scheduled_shifts')
      .innerJoin('memberships', 'memberships.id', 'scheduled_shifts.membership_id')
      .innerJoin('users', 'users.id', 'memberships.user_id')
      .select([
        'scheduled_shifts.id',
        'scheduled_shifts.membership_id',
        'scheduled_shifts.start_at',
        'scheduled_shifts.end_at',
        'scheduled_shifts.notes',
        'scheduled_shifts.color',
        'scheduled_shifts.label',
        'users.name as member_name',
        'users.email as member_email'
      ])
      .where('memberships.restaurant_id', '=', restaurantId)
      .where('scheduled_shifts.start_at', '>=', startDate)
      .where('scheduled_shifts.start_at', '<=', endDate)
      .orderBy('scheduled_shifts.start_at', 'asc')
      .execute();
  }
}
