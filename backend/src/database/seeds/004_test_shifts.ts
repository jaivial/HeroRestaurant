/**
 * Seed: 004_test_shifts
 *
 * Seeds test contracts and shifts for test users.
 */

import { Kysely } from 'kysely';

export async function seed(db: Kysely<any>): Promise<void> {
  // Get all memberships
  const memberships = await db
    .selectFrom('memberships')
    .select(['id', 'restaurant_id', 'user_id'])
    .execute();

  for (const membership of memberships) {
    // Check if contract already exists
    const existingContract = await db
      .selectFrom('member_contracts')
      .select('id')
      .where('membership_id', '=', membership.id)
      .executeTakeFirst();

    if (!existingContract) {
      // Create a 40h/week contract
      await db
        .insertInto('member_contracts')
        .values({
          id: crypto.randomUUID(),
          membership_id: membership.id,
          weekly_hours: 40.0,
          effective_from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          effective_to: null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();
      
      console.log(`✓ Created 40h contract for membership ${membership.id}`);
    }

    // Add some random shifts for the last 7 days
    const existingShifts = await db
      .selectFrom('member_shifts')
      .select('id')
      .where('membership_id', '=', membership.id)
      .executeTakeFirst();

    if (!existingShifts) {
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Skip Sundays
        if (date.getDay() === 0) continue;

        // Punch in at 9:00 AM
        const punchIn = new Date(date);
        punchIn.setHours(9, 0, 0, 0);

        // Punch out at 6:00 PM (9 hours including lunch)
        const punchOut = new Date(date);
        punchOut.setHours(18, 0, 0, 0);

        const totalMinutes = 9 * 60;

        await db
          .insertInto('member_shifts')
          .values({
            id: crypto.randomUUID(),
            membership_id: membership.id,
            punch_in_at: punchIn,
            punch_out_at: punchOut,
            total_minutes: totalMinutes,
            notes: 'Automated seed shift',
            created_at: new Date(),
            updated_at: new Date(),
          })
          .execute();
      }
      console.log(`✓ Created 7 shifts for membership ${membership.id}`);
    }
  }
}

