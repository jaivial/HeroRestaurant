import { db } from '../../database/kysely';
import argon2 from 'argon2';
import { ROLE_OWNER, RESTAURANT_FEATURES } from '../../constants/permissions';
import { hashSessionId } from '../../utils/session-id';
import crypto from 'crypto';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface TestRestaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export interface TestMenu {
  id: string;
  restaurantId: string;
  title: string;
  type: 'fixed_price' | 'open_menu';
  price?: number;
  isActive: boolean;
}

export async function createTestUser(overrides?: Partial<TestUser>): Promise<TestUser> {
  const userData = {
    id: crypto.randomUUID(),
    email: overrides?.email || `test-${Date.now()}@example.com`,
    password: overrides?.password || 'Test123!@#',
    name: overrides?.name || 'Test User',
  };

  const passwordHash = await argon2.hash(userData.password);

  await db.insertInto('users')
    .values({
      id: userData.id,
      email: userData.email,
      password_hash: passwordHash,
      name: userData.name,
      status: 'active',
      global_flags: 0n,
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  return userData;
}

export async function createTestRestaurant(ownerId: string, overrides?: Partial<TestRestaurant>): Promise<TestRestaurant> {
  const restaurantData = {
    id: crypto.randomUUID(),
    name: overrides?.name || `Test Restaurant ${Date.now()}`,
    slug: overrides?.slug || `test-restaurant-${Date.now()}`,
    ownerId,
  };

  await db.insertInto('restaurants')
    .values({
      id: restaurantData.id,
      name: restaurantData.name,
      slug: restaurantData.slug,
      owner_user_id: restaurantData.ownerId,
      status: 'active',
      subscription_tier: 'free',
      feature_flags: RESTAURANT_FEATURES.FEATURE_MENU_MANAGEMENT,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  await db.insertInto('memberships')
    .values({
      id: crypto.randomUUID(),
      user_id: restaurantData.ownerId,
      restaurant_id: restaurantData.id,
      access_flags: ROLE_OWNER,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  return restaurantData;
}

export async function createTestMenu(restaurantId: string, overrides?: Partial<TestMenu>): Promise<TestMenu> {
  const menuData = {
    id: crypto.randomUUID(),
    restaurantId,
    title: overrides?.title || `Test Menu ${Date.now()}`,
    type: (overrides?.type || 'fixed_price') as 'fixed_price' | 'open_menu',
    price: overrides?.price || 15.99,
    isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
  };

  if (menuData.type === 'fixed_price') {
    await db.insertInto('fixed_menus')
      .values({
        id: menuData.id,
        restaurant_id: restaurantId,
        title: menuData.title,
        price: menuData.price || 0,
        is_active: menuData.isActive,
        drink_included: false,
        coffee_included: false,
        availability: JSON.stringify({ breakfast: [], lunch: [], dinner: [] }),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .execute();
  }

  return menuData;
}

export async function cleanupTestData() {
  await db.deleteFrom('sessions').execute();
  await db.deleteFrom('login_attempts').execute();
  await db.deleteFrom('dishes').execute();
  await db.deleteFrom('menu_sections').execute();
  await db.deleteFrom('short_urls').execute();
  await db.deleteFrom('fixed_menus').execute();
  await db.deleteFrom('open_menus').execute();
  await db.deleteFrom('memberships').execute();
  await db.deleteFrom('restaurants').execute();
  await db.deleteFrom('users').execute();
}

export async function createTestSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const hashedSessionId = await hashSessionId(sessionId);

  await db.insertInto('sessions')
    .values({
      id: crypto.randomUUID(),
      hashed_session_id: hashedSessionId,
      user_id: userId,
      expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000),
      last_activity_at: new Date(),
      created_at: new Date(),
    })
    .execute();

  return sessionId;
}
