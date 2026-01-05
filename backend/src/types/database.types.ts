import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

// ============================================================================
// Shared Enums (can be imported by frontend)
// ============================================================================

export type UserStatus = 'active' | 'suspended' | 'pending';
export type RestaurantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'left';
export type RevocationReason = 'logout' | 'password_change' | 'security' | 'admin_action';

// ============================================================================
// Database Schema Interface
// ============================================================================

export interface DB {
  users: UsersTable;
  restaurants: RestaurantsTable;
  memberships: MembershipsTable;
  sessions: SessionsTable;
  roles: RolesTable;
  login_attempts: LoginAttemptsTable;
  restaurant_settings: RestaurantSettingsTable;
  fixed_menus: FixedMenusTable;
  open_menus: OpenMenusTable;
  menu_sections: MenuSectionsTable;
  dishes: DishesTable;
  short_urls: ShortUrlsTable;
  tables: TablesTable;
  table_groups: TableGroupsTable;
  guests: GuestsTable;
  bookings: BookingsTable;
  waitlist: WaitlistTable;
}

// ============= Users Table =============
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  email_verified_at: Date | null;
  status: UserStatus;
  global_flags: bigint;
  last_login_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// ============= Restaurants Table =============
export interface RestaurantsTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  contact_email: string | null;
  contact_phone: string | null;
  feature_flags: bigint;
  subscription_tier: SubscriptionTier;
  owner_user_id: string;
  status: RestaurantStatus;
  trial_ends_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Restaurant = Selectable<RestaurantsTable>;
export type NewRestaurant = Insertable<RestaurantsTable>;
export type RestaurantUpdate = Updateable<RestaurantsTable>;

// ============= Memberships Table =============
export interface MembershipsTable {
  id: Generated<string>;
  user_id: string;
  restaurant_id: string;
  role_id: string | null;
  access_flags: bigint;
  display_name: string | null;
  joined_at: Generated<Date>;
  invited_by_user_id: string | null;
  invitation_accepted_at: Date | null;
  status: MembershipStatus;
  last_active_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Membership = Selectable<MembershipsTable>;
export type NewMembership = Insertable<MembershipsTable>;
export type MembershipUpdate = Updateable<MembershipsTable>;

// ============= Sessions Table =============
export interface SessionsTable {
  id: Generated<string>;
  hashed_session_id: string;
  user_id: string;
  current_restaurant_id: string | null;
  device_fingerprint: string | null;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  last_activity_at: Generated<Date>;
  created_at: Generated<Date>;
  revoked_at: Date | null;
  revocation_reason: RevocationReason | null;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;

// ============= Roles Table =============
export interface RolesTable {
  id: Generated<string>;
  restaurant_id: string | null;
  name: string;
  description: string | null;
  permissions: bigint;
  is_system_role: Generated<boolean>;
  display_order: number;
  color: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Role = Selectable<RolesTable>;
export type NewRole = Insertable<RolesTable>;
export type RoleUpdate = Updateable<RolesTable>;

// ============= Login Attempts Table =============
export interface LoginAttemptsTable {
  id: Generated<string>;
  email: string;
  ip_address: string;
  user_agent: string | null;
  success: boolean;
  attempted_at: Generated<Date>;
}

export type LoginAttempt = Selectable<LoginAttemptsTable>;
export type NewLoginAttempt = Insertable<LoginAttemptsTable>;

// ============= Restaurant Settings Table =============
export interface RestaurantSettingsTable {
  id: Generated<string>;
  restaurant_id: string;
  opening_days: string; // JSON string: string[]
  meal_schedules: string; // JSON string: { breakfast: boolean, lunch: boolean, dinner: boolean }
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type RestaurantSettings = Selectable<RestaurantSettingsTable>;
export type NewRestaurantSettings = Insertable<RestaurantSettingsTable>;
export type RestaurantSettingsUpdate = Updateable<RestaurantSettingsTable>;

// ============= Fixed Menus Table =============
export type MenuType = 'fixed_price' | 'open_menu';

export interface FixedMenusTable {
  id: Generated<string>;
  restaurant_id: string;
  title: string;
  type: MenuType;
  price: number | null;
  is_active: boolean;
  drink_included: boolean;
  coffee_included: boolean;
  availability: string; // JSON string: { breakfast: string[], lunch: string[], dinner: string[] }
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type FixedMenu = Selectable<FixedMenusTable>;
export type NewFixedMenu = Insertable<FixedMenusTable>;
export type FixedMenuUpdate = Updateable<FixedMenusTable>;

// ============= Open Menus Table =============
export interface OpenMenusTable {
  id: Generated<string>;
  restaurant_id: string;
  title: string;
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type OpenMenu = Selectable<OpenMenusTable>;
export type NewOpenMenu = Insertable<OpenMenusTable>;
export type OpenMenuUpdate = Updateable<OpenMenusTable>;

// ============= Menu Sections Table =============
export interface MenuSectionsTable {
  id: Generated<string>;
  fixed_menu_id: string | null;
  open_menu_id: string | null;
  name: string;
  display_order: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type MenuSection = Selectable<MenuSectionsTable>;
export type NewMenuSection = Insertable<MenuSectionsTable>;
export type MenuSectionUpdate = Updateable<MenuSectionsTable>;

// ============= Dishes Table =============
export interface DishesTable {
  id: Generated<string>;
  section_id: string;
  fixed_menu_id: string | null;
  open_menu_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  show_image: boolean;
  show_description: boolean;
  open_modal: boolean;
  has_supplement: boolean;
  supplement_price: number | null;
  allergens: string; // JSON string: string[] (allergen IDs)
  display_order: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Dish = Selectable<DishesTable>;
export type NewDish = Insertable<DishesTable>;
export type DishUpdate = Updateable<DishesTable>;

// ============= Short URLs Table =============
export interface ShortUrlsTable {
  id: Generated<string>;
  code: string;
  menu_id: string;
  created_at: Generated<Date>;
}

export type ShortUrl = Selectable<ShortUrlsTable>;
export type NewShortUrl = Insertable<ShortUrlsTable>;
export type ShortUrlUpdate = Updateable<ShortUrlsTable>;

// ============================================================================
// Booking Manager Types
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
export type BookingSource = 'phone' | 'walk_in' | 'online' | 'third_party' | 'staff';
export type TableShape = 'round' | 'square' | 'rectangle' | 'custom';
export type WaitlistStatus = 'waiting' | 'notified' | 'seated' | 'left';
export type CancelledBy = 'staff' | 'guest';

// ============= Tables Table =============
export interface TablesTable {
  id: Generated<string>;
  restaurant_id: string;
  name: string;
  capacity: number;
  min_capacity: number;
  section: string | null;
  position_x: number | null;
  position_y: number | null;
  shape: TableShape;
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Table = Selectable<TablesTable>;
export type NewTable = Insertable<TablesTable>;
export type TableUpdate = Updateable<TablesTable>;

// ============= Table Groups Table =============
export interface TableGroupsTable {
  id: Generated<string>;
  restaurant_id: string;
  name: string;
  min_capacity: number;
  max_capacity: number;
  table_ids: string; // JSON string: string[]
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type TableGroup = Selectable<TableGroupsTable>;
export type NewTableGroup = Insertable<TableGroupsTable>;
export type TableGroupUpdate = Updateable<TableGroupsTable>;

// ============= Guests Table =============
export interface GuestsTable {
  id: Generated<string>;
  restaurant_id: string;
  email: string | null;
  phone: string;
  name: string;
  notes: string | null;
  total_visits: Generated<number>;
  total_no_shows: Generated<number>;
  total_cancellations: Generated<number>;
  last_visit_at: Date | null;
  preferences: string; // JSON string: string[]
  tags: string; // JSON string: string[]
  blocked: boolean;
  blocked_reason: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Guest = Selectable<GuestsTable>;
export type NewGuest = Insertable<GuestsTable>;
export type GuestUpdate = Updateable<GuestsTable>;

// ============= Bookings Table =============
export interface BookingsTable {
  id: Generated<string>;
  restaurant_id: string;
  guest_id: string | null;
  table_id: string | null;
  table_group_id: string | null;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string;
  party_size: number;
  date: string; // ISO date string
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  duration_minutes: number;
  status: BookingStatus;
  source: BookingSource;
  notes: string | null;
  dietary_requirements: string; // JSON string: string[]
  confirmation_sent_at: Date | null;
  reminder_sent_at: Date | null;
  cancelled_at: Date | null;
  cancelled_by: CancelledBy | null;
  cancellation_reason: string | null;
  created_by_user_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Booking = Selectable<BookingsTable>;
export type NewBooking = Insertable<BookingsTable>;
export type BookingUpdate = Updateable<BookingsTable>;

// ============= Waitlist Table =============
export interface WaitlistTable {
  id: Generated<string>;
  restaurant_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  party_size: number;
  quoted_wait_minutes: number | null;
  notes: string | null;
  notified_at: Date | null;
  seated_at: Date | null;
  status: WaitlistStatus;
  position: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type WaitlistEntry = Selectable<WaitlistTable>;
export type NewWaitlistEntry = Insertable<WaitlistTable>;
export type WaitlistEntryUpdate = Updateable<WaitlistTable>;

// Input type for waitlist (status and position are auto-assigned by repository)
export type WaitlistEntryInput = Omit<NewWaitlistEntry, 'status' | 'position' | 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'notified_at' | 'seated_at'>;
