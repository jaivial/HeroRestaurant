import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

// ============================================================================
// Shared Enums (can be imported by frontend)
// ============================================================================

export type UserStatus = 'active' | 'suspended' | 'pending';
export type RestaurantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'left';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
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
  invitations: InvitationsTable;
  login_attempts: LoginAttemptsTable;
  restaurant_settings: RestaurantSettingsTable;
  fixed_menus: FixedMenusTable;
  open_menus: OpenMenusTable;
  menu_sections: MenuSectionsTable;
  dishes: DishesTable;
  member_contracts: MemberContractsTable;
  member_shifts: MemberShiftsTable;
  user_preferences: UserPreferencesTable;
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
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  primary_color: string;
  default_language: string;
  default_tax_rate: number;
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
  opening_hours: string | null; // JSON string: OpeningHour[]
  meal_schedules: string; // JSON string: MealSchedules
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OpeningHour {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  isOpen: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
}

export interface MealSchedule {
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface MealSchedules {
  breakfast: MealSchedule;
  brunch: MealSchedule;
  lunch: MealSchedule;
  merienda: MealSchedule;
  dinner: MealSchedule;
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

// ============= Member Contracts Table =============
export interface MemberContractsTable {
  id: Generated<string>;
  membership_id: string;
  weekly_hours: number;
  effective_from: Date;
  effective_to: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type MemberContract = Selectable<MemberContractsTable>;
export type NewMemberContract = Insertable<MemberContractsTable>;
export type MemberContractUpdate = Updateable<MemberContractsTable>;

// ============= Member Shifts Table =============
export interface MemberShiftsTable {
  id: Generated<string>;
  membership_id: string;
  punch_in_at: Date;
  punch_out_at: Date | null;
  total_minutes: number | null;
  notes: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type MemberShift = Selectable<MemberShiftsTable>;
export type NewMemberShift = Insertable<MemberShiftsTable>;
export type MemberShiftUpdate = Updateable<MemberShiftsTable>;

// ============= Invitations Table =============
export interface InvitationsTable {
  id: Generated<string>;
  restaurant_id: string;
  role_id: string | null;
  inviter_id: string;
  email: string | null;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  status: InvitationStatus;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Invitation = Selectable<InvitationsTable>;
export type NewInvitation = Insertable<InvitationsTable>;
export type InvitationUpdate = Updateable<InvitationsTable>;

// ============= User Preferences Table =============
export interface UserPreferencesTable {
  id: Generated<string>;
  user_id: string;
  workspace_id: string;
  preference_key: string;
  preference_value: any;
  updated_at: Generated<Date | null>;
}

export type UserPreference = Selectable<UserPreferencesTable>;
export type NewUserPreference = Insertable<UserPreferencesTable>;
export type UserPreferenceUpdate = Updateable<UserPreferencesTable>;
