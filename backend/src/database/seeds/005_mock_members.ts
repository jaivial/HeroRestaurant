/**
 * Seed: 005_mock_members
 * 
 * Seeds several mock members with different roles for the Hero Restaurant.
 */

import { Kysely } from 'kysely';
import { randomUUID } from 'crypto';
import { TEST_RESTAURANT_ID } from './003_test_restaurant';
import { 
  ROLE_ADMIN, 
  ROLE_MANAGER, 
  ROLE_CHEF, 
  ROLE_SERVER, 
  ROLE_CASHIER 
} from '../../constants/permissions';

const MOCK_MEMBERS = [
  {
    email: 'admin@herorestaurant.com',
    name: 'Alice Admin',
    roleName: 'Admin',
    flags: ROLE_ADMIN,
  },
  {
    email: 'manager@herorestaurant.com',
    name: 'Bob Manager',
    roleName: 'Manager',
    flags: ROLE_MANAGER,
  },
  {
    email: 'chef@herorestaurant.com',
    name: 'Charlie Chef',
    roleName: 'Chef',
    flags: ROLE_CHEF,
  },
  {
    email: 'server1@herorestaurant.com',
    name: 'Sarah Server',
    roleName: 'Server',
    flags: ROLE_SERVER,
  },
  {
    email: 'server2@herorestaurant.com',
    name: 'Sam Server',
    roleName: 'Server',
    flags: ROLE_SERVER,
  },
  {
    email: 'cashier@herorestaurant.com',
    name: 'Casey Cashier',
    roleName: 'Cashier',
    flags: ROLE_CASHIER,
  },
];

export async function seed(db: Kysely<any>): Promise<void> {
  console.log('Seeding mock members for Hero Restaurant...');

  // 1. Get system roles to link by ID
  const systemRoles = await db
    .selectFrom('roles')
    .select(['id', 'name'])
    .where('is_system_role', '=', true)
    .where('restaurant_id', 'is', null)
    .execute();

  const roleMap = new Map(systemRoles.map(r => [r.name, r.id]));

  for (const member of MOCK_MEMBERS) {
    // Check if user already exists
    let user = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', member.email)
      .executeTakeFirst();

    const userId = user?.id || randomUUID();

    if (!user) {
      // Create user
      const passwordHash = await Bun.password.hash('Password@123', {
        algorithm: 'argon2id',
        memoryCost: 65536,
        timeCost: 3,
      });

      await db
        .insertInto('users')
        .values({
          id: userId,
          email: member.email,
          password_hash: passwordHash,
          name: member.name,
          status: 'active',
          global_flags: 0n,
          email_verified_at: new Date(),
        })
        .execute();
      console.log(`  - Created user: ${member.email}`);
    }

    // Check if membership already exists
    const existingMembership = await db
      .selectFrom('memberships')
      .select('id')
      .where('user_id', '=', userId)
      .where('restaurant_id', '=', TEST_RESTAURANT_ID)
      .executeTakeFirst();

    if (!existingMembership) {
      const roleId = roleMap.get(member.roleName);
      
      await db
        .insertInto('memberships')
        .values({
          id: randomUUID(),
          user_id: userId,
          restaurant_id: TEST_RESTAURANT_ID,
          role_id: roleId || null,
          access_flags: member.flags,
          status: 'active',
          joined_at: new Date(),
        })
        .execute();
      console.log(`  - Added ${member.name} as ${member.roleName} to Hero Restaurant`);
    } else {
      console.log(`  - ${member.name} is already a member, skipping`);
    }
  }

  console.log('✓ Mock members seeding complete');
}
