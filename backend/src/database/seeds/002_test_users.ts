/**
 * Seed: 002_test_users
 *
 * Seeds test users for development and testing.
 * These users are created only in development environment.
 */

import { Kysely } from 'kysely';

// Fixed UUIDs for test users (for consistent references in other seeds)
export const TEST_USER_ID = 'b38dd965-8b05-4b6a-bcd3-4e636ca4b22b';

// Test user credentials (documented in /docs/mockdata/test-users.md)
const TEST_USERS = [
  {
    id: TEST_USER_ID,
    email: 'test@herorestaurant.com',
    password: 'Test@123',
    name: 'Test User',
  },
];

export async function seed(db: Kysely<any>): Promise<void> {
  for (const testUser of TEST_USERS) {
    // Check if user already exists
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', testUser.email)
      .executeTakeFirst();

    if (existingUser) {
      console.log(`✓ Test user ${testUser.email} already exists, skipping`);
      continue;
    }

    // Hash password using Bun's native Argon2
    const passwordHash = await Bun.password.hash(testUser.password, {
      algorithm: 'argon2id',
      memoryCost: 65536,
      timeCost: 3,
    });

    // Create test user
    await db
      .insertInto('users')
      .values({
        id: testUser.id,
        email: testUser.email,
        password_hash: passwordHash,
        name: testUser.name,
        avatar_url: null,
        phone: null,
        email_verified_at: new Date(),
        status: 'active',
        global_flags: 0,
        last_login_at: null,
        deleted_at: null,
      })
      .execute();

    console.log(`✓ Created test user: ${testUser.email} (password: ${testUser.password})`);
  }
}
