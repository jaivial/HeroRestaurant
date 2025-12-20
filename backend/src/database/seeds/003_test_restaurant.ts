/**
 * Seed: 003_test_restaurant
 *
 * Seeds a test restaurant with root role and membership for the test user.
 * This creates the complete setup needed for login to work properly.
 */

import { Kysely } from 'kysely';
import { randomUUID } from 'crypto';
import { TEST_USER_ID } from './002_test_users';

// Fixed UUIDs for consistent references
export const TEST_RESTAURANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
export const ROOT_ROLE_ID = 'f9e8d7c6-b5a4-3210-fedc-ba0987654321';

// Max unsigned 64-bit value for full permissions
const MAX_PERMISSIONS = ((1n << 64n) - 1n).toString();

export async function seed(db: Kysely<any>): Promise<void> {
  // Check if restaurant already exists
  const existingRestaurant = await db
    .selectFrom('restaurants')
    .select('id')
    .where('slug', '=', 'hero-restaurant')
    .executeTakeFirst();

  if (existingRestaurant) {
    console.log('✓ Test restaurant already exists, skipping');
    return;
  }

  // 1. Create the test restaurant
  await db
    .insertInto('restaurants')
    .values({
      id: TEST_RESTAURANT_ID,
      name: 'Hero Restaurant',
      slug: 'hero-restaurant',
      description: 'Test restaurant for development',
      logo_url: null,
      cover_url: null,
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'USA',
      timezone: 'UTC',
      currency: 'USD',
      contact_email: 'contact@herorestaurant.com',
      contact_phone: '+1-555-0100',
      feature_flags: '0',
      subscription_tier: 'professional',
      owner_user_id: TEST_USER_ID,
      status: 'active',
      trial_ends_at: null,
      deleted_at: null,
    })
    .execute();

  console.log('✓ Created test restaurant: Hero Restaurant');

  // 2. Create the root role for this restaurant
  await db
    .insertInto('roles')
    .values({
      id: ROOT_ROLE_ID,
      restaurant_id: TEST_RESTAURANT_ID,
      name: 'Root',
      description: 'Root role with maximum permissions. Full system access.',
      permissions: MAX_PERMISSIONS,
      is_system_role: false,
      display_order: 100, // Highest priority
      color: '#DC2626', // Red for root
      deleted_at: null,
    })
    .execute();

  console.log('✓ Created root role with max permissions');

  // 3. Create membership linking user to restaurant with root role
  await db
    .insertInto('memberships')
    .values({
      id: randomUUID(),
      user_id: TEST_USER_ID,
      restaurant_id: TEST_RESTAURANT_ID,
      role_id: ROOT_ROLE_ID,
      access_flags: MAX_PERMISSIONS,
      display_name: 'Root Admin',
      joined_at: new Date(),
      invited_by_user_id: null,
      invitation_accepted_at: new Date(),
      status: 'active',
      last_active_at: new Date(),
      deleted_at: null,
    })
    .execute();

  console.log('✓ Created membership for test user with root role');
  console.log('');
  console.log('  Restaurant: Hero Restaurant (hero-restaurant)');
  console.log(`  User ID: ${TEST_USER_ID}`);
  console.log(`  Restaurant ID: ${TEST_RESTAURANT_ID}`);
  console.log(`  Role: Root (priority 0, max permissions)`);
}
