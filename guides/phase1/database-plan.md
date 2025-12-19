# Database Plan - Phase 1: Authentication, Multi-Tenancy, and Access Control

## 1. Overview

This phase establishes the foundational database architecture for HeroRestaurant, a multi-tenant SaaS restaurant management system. The design implements a "Shared Database, Shared Tables" multi-tenancy model using a `restaurant_id` column for tenant isolation, combined with a Slack-like workspace membership model where users can belong to multiple restaurants with distinct roles and permissions per workspace.

**Core Goals**:
- User Identity Separation: A single user account that can access multiple restaurant workspaces
- Workspace Membership: Users join restaurants as "members" with workspace-specific roles
- Granular Access Control: ULONG (64-bit) bitwise flags for efficient permission storage and checking
- Secure Session Management: Database-stored sessions with 21-hour sliding expiry
- Data Isolation: Tenant separation through application-enforced `restaurant_id` filtering

---

## 2. Entity Analysis

### 2.1 Users (Global Accounts)

**Purpose**: The `users` table represents global user identities - the person behind the screen, independent of any restaurant workspace.

**Key Characteristics**:
- One user = one email address (globally unique)
- Authentication credentials stored here (password hash)
- Personal profile information that transcends workspaces (name, avatar, phone)
- Not tied to any specific restaurant

**Fields to Consider**:
- Primary identifier (UUID recommended for security and distribution)
- Email address (unique, indexed, used for login)
- Password hash (Argon2 - never plain text)
- Full name for display purposes
- Avatar URL for profile images
- Phone number (optional, for 2FA or notifications)
- Email verification status and timestamp
- Account status (active, suspended, pending)
- Global member flags (ULONG - system-wide permissions like MEMBER_CREATE_RESTAURANT)
- Last login timestamp for security auditing
- Standard timestamps (created_at, updated_at)
- Soft delete support (deleted_at)

**Edge Cases to Address**:
- What happens when a user deletes their account but has memberships? Anonymize or cascade soft delete
- How to handle email changes? Re-verification required
- Rate limiting on failed login attempts via separate login_attempts table

### 2.2 Restaurants (Tenants/Workspaces)

**Purpose**: The `restaurants` table represents each tenant/workspace in the system. Each restaurant is an isolated data silo.

**Key Characteristics**:
- Every tenant-specific data references this table via `restaurant_id`
- Contains restaurant-specific settings and branding
- Has its own enabled feature flags (what modules this restaurant can access)
- Subscription tier affects available features

**Fields to Consider**:
- Primary identifier (UUID)
- Restaurant name
- Slug/subdomain for URL routing (unique, indexed)
- Logo URL
- Cover image URL
- Address and location data (JSON or separate fields)
- Timezone (critical for order scheduling, reports)
- Currency code (for multi-region support)
- Contact email and phone
- Restaurant-level feature flags (ULONG - what features are enabled for this tenant)
- Subscription tier or plan identifier
- Owner user ID (who created/owns this workspace)
- Status (active, trial, suspended, cancelled)
- Trial expiration date (if applicable)
- Standard timestamps
- Soft delete support

**Edge Cases to Address**:
- Restaurant deletion: Cascade soft delete all related data
- Slug changes: Allow with redirect support
- Restaurant ownership transfer: Update owner_user_id with audit log
- Minimum data required: name and owner_user_id

### 2.3 Memberships (User-Restaurant Relationships)

**Purpose**: The `memberships` table is the junction connecting users to restaurants, enabling the "one user, multiple workspaces" model.

**Key Characteristics**:
- A user can have multiple memberships (one per restaurant they belong to)
- Each membership has its own role and permissions within that workspace
- The membership record stores workspace-specific settings for that user
- Per-workspace access flags live here

**Fields to Consider**:
- Primary identifier (UUID)
- User ID (foreign key to users)
- Restaurant ID (foreign key to restaurants)
- Role ID (foreign key to roles - optional if using flag-only system)
- Member access flags (ULONG - what this member can do in this workspace)
- Display name override (optional - name shown in this workspace)
- Joined at timestamp
- Invited by user ID (who sent the invitation)
- Invitation accepted at timestamp
- Status (pending, active, suspended, left)
- Last active at (for workspace-specific activity tracking)
- Standard timestamps
- Soft delete support

**Unique Constraint**: (user_id, restaurant_id) - a user can only have one membership per restaurant

**Edge Cases to Address**:
- Only owner/admin leaves: Prevent if they are the last with owner permissions
- Re-joining after leaving: Create new membership, old one stays soft-deleted for audit
- Pending invitations expire: Background job to clean up after 7 days
- Membership history: Preserved through soft deletes

### 2.4 Sessions

**Purpose**: The `sessions` table manages active authentication sessions with sliding expiry.

**Key Characteristics**:
- Created on successful login
- 21-hour initial expiry that extends on user activity
- Must be revocable (logout, security concerns)
- Tracks device/client information for security
- Multiple sessions per user allowed (different devices)

**Fields to Consider**:
- Primary identifier (UUID)
- Hashed session ID (SHA-256 hash of the actual session ID - never store plain)
- User ID (foreign key)
- Current restaurant ID (which workspace the user is currently viewing)
- Device fingerprint or user agent string
- IP address (for security auditing)
- Expires at timestamp (the 21-hour sliding window)
- Last activity at timestamp (updated on each request, with batching)
- Created at timestamp
- Revoked at timestamp (null if active)
- Revocation reason (logout, password_change, security, admin_action)

**Indexing Strategy**:
- UNIQUE INDEX on hashed_session_id (for fast lookup on every request)
- INDEX on user_id (for "log out all sessions" functionality)
- INDEX on expires_at (for cleanup jobs)
- INDEX on (user_id, revoked_at) (active sessions per user)

**Edge Cases to Address**:
- Expiry extension frequency: Only extend if last_activity_at is older than 1 hour
- Concurrent session limits: Optional, configurable per tenant
- Automatic revocation triggers: Password change, account suspension
- Cleanup job frequency: Hourly for expired, daily for old revoked

### 2.5 Roles

**Purpose**: The `roles` table provides named permission templates that can be assigned to members.

**Key Characteristics**:
- Roles can be global (system-defined) or per-restaurant (custom)
- Each role has a base set of permission flags
- Members can have role + additional custom flags
- Roles simplify permission management

**Fields to Consider**:
- Primary identifier (UUID)
- Restaurant ID (null for global/system roles, set for custom roles)
- Role name
- Role description
- Permission flags (ULONG - base permissions for this role)
- Is system role flag (cannot be deleted or modified)
- Display order (for UI sorting)
- Color code (for UI badges)
- Standard timestamps
- Soft delete support

**Built-in System Roles**:
- **Owner**: Full control, cannot be removed, can delete restaurant
- **Admin**: Nearly full control, can manage members and settings
- **Manager**: Can manage orders, inventory, staff schedules
- **Chef/Kitchen**: Can view and update order status for kitchen
- **Server/Waiter**: Can create orders, view tables
- **Cashier**: Can process payments, view orders
- **Viewer**: Read-only access to specified areas

### 2.6 Login Attempts (Rate Limiting)

**Purpose**: Track failed login attempts for brute force protection.

**Fields**:
- Primary identifier (UUID)
- Email (indexed)
- IP address (indexed)
- Attempted at timestamp
- Success boolean
- User agent

**Cleanup**: Delete attempts older than 24 hours

---

## 3. Access Flags System Design

### 3.1 Storage

- **MySQL Type**: `BIGINT UNSIGNED` (64-bit, range 0 to 18,446,744,073,709,551,615)
- **Default Value**: 0 (no permissions)
- **Application Type**: TypeScript bigint

### 3.2 Two Types of Flags

#### A. Member Access Flags (What a member can DO)
Stored in: `memberships.access_flags` and `users.global_flags`

**Flag Allocation Strategy** (using 64-bit space):
- Bits 0-15: Core system permissions (16 flags)
- Bits 16-31: Order and sales permissions (16 flags)
- Bits 32-47: Inventory and menu permissions (16 flags)
- Bits 48-63: Administrative and settings permissions (16 flags)

**Example Member Flags**:
```
Bit 0  = CAN_VIEW_DASHBOARD
Bit 1  = CAN_VIEW_ORDERS
Bit 2  = CAN_CREATE_ORDERS
Bit 3  = CAN_UPDATE_ORDERS
Bit 4  = CAN_CANCEL_ORDERS
Bit 5  = CAN_VIEW_TABLES
Bit 6  = CAN_MANAGE_TABLES
Bit 7  = CAN_VIEW_MENU
Bit 8  = CAN_EDIT_MENU
Bit 9  = CAN_VIEW_INVENTORY
Bit 10 = CAN_MANAGE_INVENTORY
Bit 11 = CAN_VIEW_REPORTS
Bit 12 = CAN_EXPORT_REPORTS
Bit 13 = CAN_VIEW_MEMBERS
Bit 14 = CAN_INVITE_MEMBERS
Bit 15 = CAN_MANAGE_MEMBERS
Bit 16 = CAN_REMOVE_MEMBERS
Bit 17 = CAN_MANAGE_ROLES
Bit 18 = CAN_VIEW_SETTINGS
Bit 19 = CAN_EDIT_SETTINGS
Bit 20 = CAN_VIEW_BILLING
Bit 21 = CAN_MANAGE_BILLING
Bit 22 = CAN_DELETE_RESTAURANT
... up to Bit 63
```

#### B. Restaurant Feature Flags (What features are ENABLED for the tenant)
Stored in: `restaurants.feature_flags`

**Example Restaurant Flags**:
```
Bit 0  = FEATURE_BASIC_ORDERS
Bit 1  = FEATURE_TABLE_MANAGEMENT
Bit 2  = FEATURE_INVENTORY
Bit 3  = FEATURE_ADVANCED_REPORTS
Bit 4  = FEATURE_STAFF_SCHEDULING
Bit 5  = FEATURE_MULTI_LOCATION
Bit 6  = FEATURE_ONLINE_ORDERING
Bit 7  = FEATURE_DELIVERY_TRACKING
Bit 8  = FEATURE_LOYALTY_PROGRAM
Bit 9  = FEATURE_KITCHEN_DISPLAY
Bit 10 = FEATURE_INTEGRATIONS
Bit 11 = FEATURE_API_ACCESS
Bit 12 = FEATURE_WHITE_LABEL
Bit 13 = FEATURE_CUSTOM_DOMAINS
... up to Bit 63
```

### 3.3 Permission Check Logic

To determine if a member can perform an action:
1. Check if the restaurant has the required feature enabled
2. Check if the member has the required permission flag

```
canDoAction = (restaurant.feature_flags & REQUIRED_FEATURE) &&
              (membership.access_flags & REQUIRED_PERMISSION)
```

### 3.4 Bitwise Operations Reference

- **Setting a Flag**: `flags = flags | PERMISSION_FLAG`
- **Clearing a Flag**: `flags = flags & ~PERMISSION_FLAG`
- **Checking a Flag**: `hasPermission = (flags & PERMISSION_FLAG) !== 0`
- **Checking ALL Flags**: `hasAll = (flags & requiredFlags) === requiredFlags`
- **Checking ANY Flag**: `hasAny = (flags & requiredFlags) !== 0`

### 3.5 Flag Inheritance Model

Effective permissions = `role.permissions | membership.access_flags`

This allows assigning a role for base permissions and adding specific extra permissions to individual members.

---

## 4. Relationship Mapping

### Entity Relationship Diagram

```
users (1) -----> (*) memberships (*) <----- (1) restaurants
   |                    |                         |
   |                    v                         |
   |               (*) roles (*)                  |
   |                                              |
   +----------> (*) sessions (*) <----------------+
```

### Detailed Relationships

1. **users -> memberships**: One-to-Many (One user, many workspace memberships)
2. **restaurants -> memberships**: One-to-Many (One restaurant, many members)
3. **users -> sessions**: One-to-Many (One user, many active sessions)
4. **sessions -> restaurants**: Many-to-One (Session tracks current workspace context)
5. **roles -> memberships**: One-to-Many (One role assigned to many members)
6. **restaurants -> roles**: One-to-Many (Custom roles per restaurant)

---

## 5. Session Management Design

### Session Creation Flow

1. User submits credentials (email + password)
2. System validates credentials against `users` table
3. System creates a new session record with:
   - Cryptographically secure session ID (32 bytes, URL-safe base64)
   - Hashed session ID stored in database
   - expires_at = current time + 21 hours
4. Return plain session ID to client

### Session Validation Flow (Every Request)

1. Extract session ID from Authorization header
2. Hash the session ID
3. Query sessions table: find by hashed_session_id where revoked_at IS NULL
4. Check if expires_at > current time
5. If valid: extend expiry (if stale), populate request context
6. If invalid: Return 401 Unauthorized

### Session Extension Strategy

- Only extend if last_activity_at is older than 1 hour
- This reduces database writes from every request to ~1 per hour
- Update both expires_at (21 hours from now) and last_activity_at

### Session Revocation Scenarios

1. **User Logout**: Set revoked_at, reason = 'logout'
2. **Password Change**: Revoke all sessions except current
3. **Security Breach**: Revoke all sessions
4. **Admin Action**: Revoke specific session
5. **Account Suspension**: Revoke all sessions

---

## 6. Data Isolation Strategy

### The tenant_id Pattern

Every table containing tenant-specific data MUST include a `restaurant_id` column referencing the restaurants table.

### Application-Level Enforcement

1. Every authenticated request extracts current restaurant context from session
2. Every database query for tenant data includes `WHERE restaurant_id = ?`
3. Every insert sets restaurant_id from the session context
4. Enforced at the repository layer, not service layer

### Workspace Switching

When a user switches restaurant context:
1. Verify user has active membership in target restaurant
2. Update session's current_restaurant_id
3. Clear any cached permissions
4. Frontend reloads permissions for new context

---

## 7. Indexing Strategy

### users table
- PRIMARY KEY on id
- UNIQUE INDEX on email
- INDEX on created_at
- INDEX on deleted_at

### restaurants table
- PRIMARY KEY on id
- UNIQUE INDEX on slug
- INDEX on owner_user_id
- INDEX on (status, deleted_at)

### memberships table
- PRIMARY KEY on id
- UNIQUE INDEX on (user_id, restaurant_id)
- INDEX on user_id
- INDEX on restaurant_id
- INDEX on role_id
- INDEX on (status, deleted_at)

### sessions table
- PRIMARY KEY on id
- UNIQUE INDEX on hashed_session_id
- INDEX on user_id
- INDEX on expires_at
- INDEX on (user_id, revoked_at)

### roles table
- PRIMARY KEY on id
- INDEX on restaurant_id
- INDEX on (restaurant_id, is_system_role)

---

## 8. Migration Plan

Execute migrations in this exact order:

1. **Migration 001**: Create users table
2. **Migration 002**: Create restaurants table (FK to users for owner)
3. **Migration 003**: Create roles table (FK to restaurants, nullable)
4. **Migration 004**: Create memberships table (FKs to users, restaurants, roles)
5. **Migration 005**: Create sessions table (FKs to users, restaurants)
6. **Migration 006**: Create login_attempts table
7. **Migration 007**: Seed system roles

---

## 9. Seed Data Requirements

### System Roles (Required for Production)

1. Owner - All flags set to 1
2. Admin - All except CAN_DELETE_RESTAURANT
3. Manager - Order, table, inventory, report, member view access
4. Chef - Kitchen-related permissions only
5. Server - Order creation and table view only
6. Cashier - Order view and payment processing
7. Viewer - Read-only access to dashboard and reports

### Development Seeds

- Test users with various roles
- Test restaurant with all features enabled
- Sample memberships demonstrating multi-workspace

---

## 10. Security Considerations

### Password Storage
- Use Argon2id with appropriate parameters
- Never store or log plaintext passwords

### Session Security
- Session IDs: 256 bits of entropy (32 bytes)
- Store hashed session IDs in database
- httpOnly, Secure, SameSite=Strict cookies
- Absolute session timeout: 7 days regardless of activity

### Permission Checking
- Always check permissions server-side
- Use middleware to enforce permission checks
- Log permission denials for security auditing

### Data Isolation
- Every query must include restaurant_id filter
- Implement query auditing for cross-tenant access attempts

---

## 11. Implementation Sequence

1. Create all tables with migrations
2. Define permission constants in TypeScript
3. Implement session service (create, validate, extend, revoke)
4. Implement session middleware
5. Implement auth handlers (login, logout, me)
6. Implement permission middleware
7. Implement user/restaurant/membership handlers
8. Seed system roles
9. Write comprehensive tests
