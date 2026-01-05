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

export interface TestTable {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  section: string | null;
}

export interface TestGuest {
  id: string;
  restaurantId: string;
  name: string;
  phone: string;
  email: string | null;
  total_visits: number;
  total_no_shows: number;
}

export interface TestBooking {
  id: string;
  restaurantId: string;
  guestId: string | null;
  tableId: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
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
  await db.deleteFrom('bookings').execute();
  await db.deleteFrom('waitlist').execute();
  await db.deleteFrom('guests').execute();
  await db.deleteFrom('table_groups').execute();
  await db.deleteFrom('tables').execute();
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

export async function createTestTable(restaurantId: string, overrides?: Partial<TestTable>): Promise<TestTable> {
  const tableData = {
    id: crypto.randomUUID(),
    restaurantId,
    name: overrides?.name || `Table ${Date.now()}`,
    capacity: overrides?.capacity || 4,
    section: overrides?.section || 'Main',
  };

  await db.insertInto('tables')
    .values({
      id: tableData.id,
      restaurant_id: restaurantId,
      name: tableData.name,
      capacity: tableData.capacity,
      min_capacity: 1,
      section: tableData.section,
      shape: 'square',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  return tableData;
}

export async function createTestGuest(restaurantId: string, overrides?: Partial<TestGuest>): Promise<TestGuest> {
  const guestData = {
    id: crypto.randomUUID(),
    restaurantId,
    name: overrides?.name || `Guest ${Date.now()}`,
    phone: overrides?.phone || `+1555${Date.now().toString().slice(-7)}`,
    email: overrides?.email || `guest-${Date.now()}@example.com`,
    total_visits: 0,
    total_no_shows: 0,
  };

  await db.insertInto('guests')
    .values({
      id: guestData.id,
      restaurant_id: restaurantId,
      name: guestData.name,
      phone: guestData.phone,
      email: guestData.email,
      total_visits: 0,
      total_no_shows: 0,
      total_cancellations: 0,
      preferences: '[]',
      tags: '[]',
      blocked: false,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  return guestData;
}

export async function createTestBooking(
  restaurantId: string,
  overrides?: Partial<TestBooking>
): Promise<TestBooking> {
  const bookingData = {
    id: crypto.randomUUID(),
    restaurantId,
    guestId: overrides?.guestId || null,
    tableId: overrides?.tableId || null,
    guestName: overrides?.guestName || `Guest ${Date.now()}`,
    guestPhone: overrides?.guestPhone || `+1555${Date.now().toString().slice(-7)}`,
    partySize: overrides?.partySize || 2,
    date: overrides?.date || new Date().toISOString().split('T')[0],
    startTime: overrides?.startTime || '19:00',
    endTime: overrides?.endTime || '20:30',
    status: overrides?.status || 'pending',
    source: overrides?.source || 'phone',
  };

  await db.insertInto('bookings')
    .values({
      id: bookingData.id,
      restaurant_id: restaurantId,
      guest_id: bookingData.guestId,
      table_id: bookingData.tableId,
      guest_name: bookingData.guestName,
      guest_phone: bookingData.guestPhone,
      party_size: bookingData.partySize,
      date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      duration_minutes: 90,
      status: bookingData.status,
      source: bookingData.source,
      dietary_requirements: '[]',
      created_by_user_id: 'test-user-id',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .execute();

  return bookingData;
}
