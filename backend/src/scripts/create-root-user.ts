import { db } from '../database/kysely';
import { USER_ACCESS_FLAGS, ROLE_OWNER } from '../constants/permissions';

async function createRootUser() {
  const email = 'root@herorestaurant.com';
  const password = '123123';
  const name = 'System Administrator';

  console.log(`Checking if root user exists: ${email}...`);

  const existingUser = await db
    .selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst();

  const passwordHash = await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536,
    timeCost: 3,
  });

  let userId = existingUser?.id;

  if (existingUser) {
    console.log(`Root user already exists, updating global_flags to ROOT...`);
    await db
      .updateTable('users')
      .set({
        global_flags: USER_ACCESS_FLAGS.ROOT,
      })
      .where('id', '=', existingUser.id)
      .execute();
    console.log(`✓ Updated root user flags.`);
  } else {
    console.log(`Creating root user...`);
    userId = crypto.randomUUID();
    await db
      .insertInto('users')
      .values({
        id: userId,
        email,
        password_hash: passwordHash,
        name,
        status: 'active',
        global_flags: USER_ACCESS_FLAGS.ROOT,
        email_verified_at: new Date(),
      })
      .execute();
    console.log(`✓ Created root user: ${email} (password: ${password})`);
  }

  // Ensure root user has membership in the test restaurant
  const testRestaurant = await db
    .selectFrom('restaurants')
    .select('id')
    .where('slug', '=', 'hero-restaurant')
    .executeTakeFirst();

  if (testRestaurant && userId) {
    const existingMembership = await db
      .selectFrom('memberships')
      .select('id')
      .where('user_id', '=', userId)
      .where('restaurant_id', '=', testRestaurant.id)
      .executeTakeFirst();

    if (!existingMembership) {
      console.log('Adding root user to test restaurant...');
      
      // Get the Root role ID (fixed in 003_test_restaurant.ts)
      const ROOT_ROLE_ID = 'f9e8d7c6-b5a4-3210-fedc-ba0987654321';
      const MAX_PERMISSIONS = (1n << 64n) - 1n;

      await db
        .insertInto('memberships')
        .values({
          id: crypto.randomUUID(),
          user_id: userId,
          restaurant_id: testRestaurant.id,
          role_id: ROOT_ROLE_ID,
          access_flags: MAX_PERMISSIONS,
          status: 'active',
          joined_at: new Date(),
        })
        .execute();
      console.log('✓ Added root user to test restaurant with Root role.');
    } else {
      console.log('Root user already member of test restaurant, updating role...');
      
      const ROOT_ROLE_ID = 'f9e8d7c6-b5a4-3210-fedc-ba0987654321';
      const MAX_PERMISSIONS = (1n << 64n) - 1n;

      await db
        .updateTable('memberships')
        .set({
          role_id: ROOT_ROLE_ID,
          access_flags: MAX_PERMISSIONS,
        })
        .where('user_id', '=', userId)
        .where('restaurant_id', '=', testRestaurant.id)
        .execute();
      console.log('✓ Updated root user to Root role.');
    }
  }

  process.exit(0);
}

createRootUser().catch((err) => {
  console.error('Failed to create root user:', err);
  process.exit(1);
});
