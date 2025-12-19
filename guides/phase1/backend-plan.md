# Backend Plan - Phase 1: Authentication, Sessions, and Permissions

## Overview

This phase establishes the foundational security layer for the HeroRestaurant multi-tenant platform. The system will provide session-based authentication with sliding expiration, a bitwise permission system operating at both user (member) and restaurant (tenant) levels, and secure WebSocket integration for real-time operations.

The goal is to build a secure, scalable authentication and authorization system that:
- Maintains user sessions with automatic activity-based extension
- Provides granular permission control using 64-bit flag systems
- Supports multi-tenant isolation where users can belong to multiple restaurants with different roles
- Enables real-time WebSocket communication with session validation
- Follows the established layered architecture from the backend-organization documentation

---

## Framework: Elysia

The backend uses **Elysia** as the web framework (not Hono). Elysia is a TypeScript-first, Bun-native framework with excellent type inference and validation.

### Core Patterns

**Route Definition:**
```typescript
import { Elysia, t } from 'elysia';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/login', async ({ body, headers, set }) => {
    // Handler implementation
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
    }),
  });
```

**Schema Validation (using `t` from Elysia):**
```typescript
// Request body validation
body: t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
  name: t.String({ minLength: 1 }),
})

// Query parameters
query: t.Object({
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
})

// Route parameters
params: t.Object({
  id: t.String(),
})
```

**Middleware as Plugins (using `.derive()`):**
```typescript
export const sessionMiddleware = new Elysia({ name: 'session' })
  .derive(async ({ headers }) => {
    // Extract and validate session
    const sessionId = extractSessionId(headers);
    const session = await validateSession(sessionId);

    // Return values to add to context
    return {
      user: session.user,
      session,
      userId: session.userId,
      globalFlags: session.globalFlags,
    };
  });
```

**Permission Guards (using `.onBeforeHandle()`):**
```typescript
export const requirePermissions = (requirements: PermissionRequirements) =>
  new Elysia({ name: 'permissions' })
    .use(sessionMiddleware)
    .onBeforeHandle(({ userId, globalFlags, params }) => {
      // Check permissions, throw if denied
      if (!hasPermission(globalFlags, requirements.member)) {
        throw Errors.PERMISSION_DENIED;
      }
    });
```

**Error Handling (using `.onError()`):**
```typescript
const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { success: false, error: { code: error.code, message: error.message } };
    }
    // Handle validation errors by error.name === 'ValidationError'
  });
```

**Context Destructuring:**
```typescript
.post('/endpoint', async ({ body, headers, set, params, query, userId, session }) => {
  // body: Validated request body
  // headers: Request headers
  // set: Object to set response status/headers (set.status = 201)
  // params: Route parameters
  // query: Query parameters
  // userId, session: Custom context from middleware
})
```

**Response Patterns:**
```typescript
// Success - return plain objects
return { success: true, data: { user, session } };

// Set status code
set.status = 201;
return { success: true, data: createdResource };

// Errors - throw custom errors or return error objects
throw Errors.NOT_FOUND;
// or
set.status = 404;
return { success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } };
```

**Route Grouping:**
```typescript
const app = new Elysia()
  .group('/api', (app) => app
    .use(authRoutes)
    .use(userRoutes)
    .use(restaurantRoutes)
  );
```

### Key Differences from Hono

| Aspect | Elysia | Hono |
|--------|--------|------|
| Validation | Built-in `t` schema | External (Zod adapter) |
| Middleware | `.derive()` plugin pattern | `c.set()` context |
| Error Handling | `.onError()` with error types | Try-catch in handlers |
| Type Inference | Automatic from schemas | Manual type annotations |
| Context | Destructured in handler params | Single `c` context object |

---

## 1. Authentication Flow Analysis

### 1.1 Login Process and Session Creation

When a user attempts to log in, the system must perform several critical steps in sequence:

**Credential Validation**: The login endpoint receives an email and password. The system looks up the user by email, then uses a timing-safe comparison to verify the password hash. Timing-safe comparison prevents timing attacks where attackers measure response times to guess passwords character by character.

**Session Generation**: Upon successful password verification, the system generates a new session. The session ID must be cryptographically secure with at least 128 bits of entropy (as recommended by OWASP). Bun's native crypto module should be used to generate a random 32-byte value, which is then encoded as a URL-safe base64 string.

**Session Storage**: The session record in the database should contain:
- The session ID (hashed for storage - never store plain session IDs)
- The user ID it belongs to
- Creation timestamp (for absolute timeout enforcement)
- Last activity timestamp (for sliding expiration)
- Expiration timestamp (21 hours from creation/last activity)
- Device/user-agent information (for audit and multi-device tracking)
- IP address (for security monitoring)

**Response**: The plain session ID is returned to the client in the response body (not as a cookie for this API-first design). The client stores this and sends it with every subsequent request in the Authorization header.

### 1.2 Session Validation on Each Request

Every authenticated request must go through session validation middleware:

**Header Extraction**: The middleware extracts the session ID from the Authorization header (format: `Session <session-id>`).

**Session Lookup**: The system hashes the provided session ID and looks it up in the database. Using a hashed session ID in storage means even if the database is compromised, attackers cannot use the stored values directly.

**Validity Checks**: The middleware must verify:
- Session exists in database
- Current time is before expiration timestamp
- Session has not been explicitly revoked
- (Optionally) IP address matches or is within acceptable range

**Context Population**: Valid sessions result in the user ID, user's global flags, and current restaurant context being added to the request context for downstream handlers.

### 1.3 Session Extension Mechanism (Sliding Expiration)

The sliding expiration extends the session lifetime whenever the user is active. This provides better user experience while maintaining security:

**Activity Definition**: Any authenticated request (GET, POST, etc.) constitutes user activity. The system should NOT extend on failed requests or rate-limited requests.

**Extension Logic**: After successful request processing (but before response), update the session's expiration timestamp to current time plus 21 hours. Also update the last_activity_at timestamp for audit purposes.

**Batching Considerations**: To avoid database writes on every single request, consider extending only if more than N minutes have passed since the last extension. For example, if the last activity was 5 minutes ago, skip the extension write. This reduces database load while maintaining acceptable precision.

**Maximum Lifetime**: Even with sliding expiration, sessions should have an absolute maximum lifetime (e.g., 7 days from creation) after which re-authentication is required regardless of activity.

### 1.4 Logout and Session Revocation

**Single Session Logout**: When a user logs out, delete or mark as revoked the specific session they used to make the request.

**All Sessions Logout**: Provide an endpoint to revoke all sessions for a user. This is critical for security incidents or when a user changes their password.

**Revocation Storage**: Rather than deleting sessions immediately, mark them as revoked with a timestamp. This preserves audit trails and allows detection of attempted use of revoked sessions.

### 1.5 Multi-Device Session Handling

Users will access the system from multiple devices (mobile, tablet, desktop):

**Session per Device**: Each device/browser gets its own session. The user_sessions table tracks all active sessions per user.

**Session Listing**: The /auth/sessions endpoint returns all active sessions for the current user, showing device info and last activity time.

**Individual Revocation**: Users can revoke individual sessions (e.g., "log out from my phone").

**Session Limits**: Consider limiting maximum concurrent sessions per user (e.g., 10) to prevent session accumulation attacks.

---

## 2. Session Middleware Design

### 2.1 Middleware Interception Flow

The session middleware intercepts all requests to protected routes:

```
Request → Extract Session ID → Validate Session → Extend Expiry → Populate Context → Next Handler
                 ↓                    ↓                                    ↓
            Missing ID          Invalid/Expired                     Return 401/403
```

**Registration**: The middleware is registered on route groups. Public routes (login, register, public menu views) bypass this middleware entirely.

### 2.2 Session Lookup and Validation

**Efficient Lookup**: The sessions table should have an index on the hashed_session_id column for O(1) lookup performance.

**Single Query**: Combine session lookup with user data fetch in a single query using a JOIN to reduce database round trips:
- sessions table provides session validity
- users table provides user flags and basic info
- memberships table (joined through restaurant context) provides restaurant-specific flags

### 2.3 Automatic Expiry Extension on Activity

**When to Extend**: Extension happens in the "post-processing" phase, after the request handler completes successfully but before the response is sent.

**Conditional Extension**: Only extend if:
- Request was successful (2xx status)
- More than 5 minutes since last extension (reduces DB writes)
- Session still has remaining sliding window (not at absolute max)

**Async Extension**: The extension update can be done asynchronously (fire-and-forget) to not add latency to the response. If the update fails, the session simply expires sooner, which is acceptable.

### 2.4 Handling Expired/Invalid Sessions

**Expired Session**: Return 401 Unauthorized with error code `SESSION_EXPIRED`. Include a helpful message indicating the user should log in again.

**Invalid Session ID**: Return 401 Unauthorized with error code `INVALID_SESSION`. Do not reveal whether the session ever existed (prevents enumeration).

**Revoked Session**: Return 401 Unauthorized with error code `SESSION_REVOKED`. This specific code helps client apps understand the difference from natural expiration.

### 2.5 Performance Considerations

**Session Caching**: For high-traffic applications, consider caching active sessions in memory (or Redis) with a short TTL (e.g., 1 minute). The cache is checked first, database is the fallback. Cache invalidation occurs on logout.

**Connection Pooling**: Use Kysely's connection pooling to handle concurrent session lookups efficiently.

**Read Replicas**: Session reads can go to read replicas; writes (extension, revocation) must go to the primary.

---

## 3. Permission System Design

### 3.1 ULONG Flag Structure Explanation

A 64-bit unsigned integer (ULONG/BigInt) stores up to 64 individual boolean permissions in a single number. Each permission is represented by a single bit position:

```
Position 0  (2^0  = 1):          PERMISSION_A
Position 1  (2^1  = 2):          PERMISSION_B
Position 2  (2^2  = 4):          PERMISSION_C
Position 3  (2^3  = 8):          PERMISSION_D
...
Position 63 (2^63 = 9223372036854775808): PERMISSION_LAST
```

**Why 64-bit?**: JavaScript's safe integer limit is 2^53-1 for regular numbers, but using BigInt allows full 64-bit support. MySQL's BIGINT UNSIGNED also supports this range.

**Benefits**:
- Single column storage (one BIGINT instead of 64 boolean columns)
- O(1) permission checks using bitwise AND
- Easy permission combination using bitwise OR
- Efficient permission removal using bitwise AND NOT
- Can be included in session data without significant overhead

### 3.2 Permission Constant Definitions

Permissions should be defined as TypeScript constants using BigInt:

**Naming Convention**: Use SCREAMING_SNAKE_CASE with a prefix indicating the permission domain (MEMBER_ or RESTAURANT_).

**Grouping**: Group related permissions by bit range:
- Bits 0-15: Basic user operations
- Bits 16-31: Content management
- Bits 32-47: Administrative operations
- Bits 48-63: System/super-admin operations

**Example Member Flags** (global user capabilities):
- `MEMBER_VIEW_OWN_PROFILE`: Can view their own profile
- `MEMBER_EDIT_OWN_PROFILE`: Can edit their own profile
- `MEMBER_CREATE_RESTAURANT`: Can create new restaurants
- `MEMBER_VIEW_ANY_PUBLIC_RESTAURANT`: Can view public restaurant menus
- `MEMBER_SYSTEM_ADMIN`: Full system administrator access

**Example Restaurant Flags** (tenant/restaurant-specific):
- `RESTAURANT_VIEW_MENU`: Can view the restaurant's menu
- `RESTAURANT_EDIT_MENU`: Can create/edit menu items
- `RESTAURANT_VIEW_ORDERS`: Can see incoming orders
- `RESTAURANT_MANAGE_ORDERS`: Can update order status
- `RESTAURANT_VIEW_STAFF`: Can see staff list
- `RESTAURANT_MANAGE_STAFF`: Can add/remove/modify staff roles
- `RESTAURANT_VIEW_ANALYTICS`: Can view restaurant analytics
- `RESTAURANT_MANAGE_SETTINGS`: Can modify restaurant settings
- `RESTAURANT_OWNER`: Full owner privileges

### 3.3 Member Flags vs Restaurant Flags

**Two-Tier Permission Model**:

**Member Flags** are stored on the users table. They represent global capabilities that apply system-wide, regardless of which restaurant the user is interacting with. Examples:
- Can they create new restaurants?
- Are they a system administrator?
- Are they banned from the platform?

**Restaurant Flags** are stored on the memberships table (junction between users and restaurants). They represent capabilities within a specific restaurant. Examples:
- Can they edit this restaurant's menu?
- Can they see this restaurant's orders?
- Are they an owner of this restaurant?

**Permission Check Flow**:
1. First check member flags (user must not be banned, etc.)
2. Then check restaurant flags (user must have specific capability for this restaurant)
3. Both must pass for the action to be allowed

### 3.4 Permission Inheritance and Combination

**Predefined Roles**: While using bitflags, define convenience "role" constants that combine multiple flags:

```
ROLE_RESTAURANT_VIEWER = RESTAURANT_VIEW_MENU | RESTAURANT_VIEW_ORDERS
ROLE_RESTAURANT_EDITOR = ROLE_RESTAURANT_VIEWER | RESTAURANT_EDIT_MENU | RESTAURANT_MANAGE_ORDERS
ROLE_RESTAURANT_MANAGER = ROLE_RESTAURANT_EDITOR | RESTAURANT_VIEW_STAFF | RESTAURANT_VIEW_ANALYTICS
ROLE_RESTAURANT_OWNER = (all restaurant flags set)
```

**Custom Permissions**: In addition to predefined roles, administrators can assign custom flag combinations for fine-grained access.

**Permission Operations**:
- `hasPermission(userFlags, requiredFlags)`: Returns true if user has ALL required flags
- `hasAnyPermission(userFlags, possibleFlags)`: Returns true if user has ANY of the flags
- `grantPermission(currentFlags, newFlags)`: Returns flags with new permissions added
- `revokePermission(currentFlags, removeFlags)`: Returns flags with permissions removed

### 3.5 Middleware for Permission Checking

A `requirePermissions` middleware factory creates route-specific permission guards:

**Usage Pattern**:
```typescript
route.post('/menu-items',
  sessionMiddleware,
  requirePermissions({ restaurant: RESTAURANT_EDIT_MENU }),
  handler
)
```

**Middleware Logic**:
1. Extract member flags from request context (populated by session middleware)
2. Extract restaurant ID from route params or request body
3. Look up user's membership in that restaurant to get restaurant flags
4. Check if user has ALL required member flags AND ALL required restaurant flags
5. If check fails, return 403 Forbidden with error code `INSUFFICIENT_PERMISSIONS`

**Caching Memberships**: Since permission checks happen frequently, cache the user's restaurant memberships in the session context after first lookup.

### 3.6 Route-Level Permission Requirements

Document required permissions for each route:

**Auth Routes** (no permissions required - public or self-authenticated):
- `POST /auth/login` - Public
- `POST /auth/register` - Public
- `POST /auth/logout` - Session required (no specific permissions)
- `GET /auth/me` - Session required (no specific permissions)
- `GET /auth/sessions` - Session required (no specific permissions)
- `DELETE /auth/sessions/:id` - Session required (no specific permissions, but must own session)

**User Routes**:
- `GET /users/me` - Session required
- `PATCH /users/me` - Session required + `MEMBER_EDIT_OWN_PROFILE`
- `GET /users/:id` - Admin only (`MEMBER_SYSTEM_ADMIN`)
- `GET /users` - Admin only (`MEMBER_SYSTEM_ADMIN`)

**Restaurant Routes**:
- `POST /restaurants` - `MEMBER_CREATE_RESTAURANT`
- `GET /restaurants` - Session required (returns user's restaurants only)
- `GET /restaurants/:id` - `RESTAURANT_VIEW_MENU` (for that restaurant)
- `PATCH /restaurants/:id` - `RESTAURANT_MANAGE_SETTINGS`
- `DELETE /restaurants/:id` - `RESTAURANT_OWNER`

**Menu Routes**:
- `GET /restaurants/:id/menu` - `RESTAURANT_VIEW_MENU`
- `POST /restaurants/:id/menu/items` - `RESTAURANT_EDIT_MENU`
- `PATCH /restaurants/:id/menu/items/:itemId` - `RESTAURANT_EDIT_MENU`
- `DELETE /restaurants/:id/menu/items/:itemId` - `RESTAURANT_EDIT_MENU`

**Membership/Staff Routes**:
- `GET /restaurants/:id/staff` - `RESTAURANT_VIEW_STAFF`
- `POST /restaurants/:id/staff` - `RESTAURANT_MANAGE_STAFF`
- `PATCH /restaurants/:id/staff/:userId` - `RESTAURANT_MANAGE_STAFF`
- `DELETE /restaurants/:id/staff/:userId` - `RESTAURANT_MANAGE_STAFF`

---

## 4. API Endpoints Specification

### 4.1 Authentication Endpoints

**POST /auth/register**
- Purpose: Create a new user account
- Permissions: Public
- Body: `{ email, password, name }`
- Response: `{ user: { id, email, name }, session: { id, expiresAt } }`
- Notes: Password must meet complexity requirements (8+ chars, mixed case, number). Rate limited to prevent spam registration.

**POST /auth/login**
- Purpose: Authenticate user and create session
- Permissions: Public
- Body: `{ email, password, deviceInfo? }`
- Response: `{ user: { id, email, name, memberFlags }, session: { id, expiresAt } }`
- Notes: Returns 401 on invalid credentials. Implements exponential backoff after failed attempts.

**POST /auth/logout**
- Purpose: Invalidate current session
- Permissions: Valid session
- Body: None (session from header)
- Response: `{ success: true }`
- Notes: Immediate session revocation in database.

**POST /auth/logout-all**
- Purpose: Invalidate all user sessions
- Permissions: Valid session
- Body: None
- Response: `{ success: true, sessionsRevoked: number }`
- Notes: Used when user changes password or suspects compromise.

**GET /auth/me**
- Purpose: Get current user info and validate/extend session
- Permissions: Valid session
- Response: `{ user: { id, email, name, memberFlags }, session: { expiresAt, createdAt } }`
- Notes: This endpoint is called frequently by clients to check session validity. It extends the session expiry.

**GET /auth/sessions**
- Purpose: List all active sessions for current user
- Permissions: Valid session
- Response: `{ sessions: [{ id, deviceInfo, lastActivity, createdAt, current }] }`
- Notes: The `current` flag indicates which session made this request.

**DELETE /auth/sessions/:sessionId**
- Purpose: Revoke a specific session
- Permissions: Valid session (must own the session being revoked)
- Response: `{ success: true }`
- Notes: Cannot revoke current session via this endpoint (use /auth/logout).

### 4.2 User Management Endpoints

**GET /users/me**
- Purpose: Get detailed profile of current user
- Permissions: Valid session
- Response: `{ user: { id, email, name, memberFlags, createdAt, restaurants: [...] } }`

**PATCH /users/me**
- Purpose: Update current user's profile
- Permissions: Valid session + `MEMBER_EDIT_OWN_PROFILE`
- Body: `{ name?, email?, password? }`
- Response: `{ user: { id, email, name } }`
- Notes: Email change requires verification. Password change revokes all other sessions.

**GET /users** (admin)
- Purpose: List all users in system
- Permissions: `MEMBER_SYSTEM_ADMIN`
- Query: `{ page, limit, search?, status? }`
- Response: `{ users: [...], meta: { page, limit, total } }`

**GET /users/:id** (admin)
- Purpose: Get any user's details
- Permissions: `MEMBER_SYSTEM_ADMIN`
- Response: `{ user: { ... } }`

**PATCH /users/:id** (admin)
- Purpose: Modify any user's account
- Permissions: `MEMBER_SYSTEM_ADMIN`
- Body: `{ memberFlags?, status? }`
- Response: `{ user: { ... } }`

### 4.3 Restaurant/Workspace Endpoints

**POST /restaurants**
- Purpose: Create a new restaurant
- Permissions: Valid session + `MEMBER_CREATE_RESTAURANT`
- Body: `{ name, description?, timezone?, currency? }`
- Response: `{ restaurant: { id, name, ... } }`
- Notes: Creator automatically becomes owner (full restaurant flags).

**GET /restaurants**
- Purpose: List restaurants user belongs to
- Permissions: Valid session
- Query: `{ page?, limit? }`
- Response: `{ restaurants: [{ id, name, role, restaurantFlags }] }`

**GET /restaurants/:id**
- Purpose: Get restaurant details
- Permissions: `RESTAURANT_VIEW_MENU` for that restaurant
- Response: `{ restaurant: { id, name, description, settings, ... } }`

**PATCH /restaurants/:id**
- Purpose: Update restaurant settings
- Permissions: `RESTAURANT_MANAGE_SETTINGS`
- Body: `{ name?, description?, settings?: { ... } }`
- Response: `{ restaurant: { ... } }`

**DELETE /restaurants/:id**
- Purpose: Delete restaurant and all associated data
- Permissions: `RESTAURANT_OWNER`
- Response: `{ success: true }`
- Notes: Soft delete. Requires confirmation token in body.

### 4.4 Membership Endpoints

**GET /restaurants/:id/members**
- Purpose: List all staff members for a restaurant
- Permissions: `RESTAURANT_VIEW_STAFF`
- Response: `{ members: [{ userId, name, email, role, restaurantFlags, joinedAt }] }`

**POST /restaurants/:id/members**
- Purpose: Invite/add a user to restaurant
- Permissions: `RESTAURANT_MANAGE_STAFF`
- Body: `{ email, restaurantFlags?, role? }`
- Response: `{ membership: { userId, restaurantFlags } }`
- Notes: If user exists, add directly. If not, send invitation email.

**PATCH /restaurants/:id/members/:userId**
- Purpose: Update member's permissions
- Permissions: `RESTAURANT_MANAGE_STAFF`
- Body: `{ restaurantFlags?, role? }`
- Response: `{ membership: { ... } }`
- Notes: Cannot modify own permissions. Cannot grant permissions you don't have.

**DELETE /restaurants/:id/members/:userId**
- Purpose: Remove member from restaurant
- Permissions: `RESTAURANT_MANAGE_STAFF`
- Response: `{ success: true }`
- Notes: Cannot remove yourself. Cannot remove last owner.

---

## 5. WebSocket Authentication

### 5.1 Authenticating WebSocket Connections

WebSocket connections begin with an HTTP upgrade handshake. Authentication happens in two phases:

**Phase 1 - Connection Upgrade**:
The client initiates a WebSocket connection to `/ws`. During the upgrade, optionally accept a session ID via query parameter for initial validation. However, for security, the primary authentication should happen via message.

**Phase 2 - Authentication Message**:
After connection is established, the client must send an `auth` message containing their session ID within 10 seconds. Until authenticated, the connection is in a "pending" state and can only receive error messages.

```
Client connects → ws://server/ws
Server accepts connection, starts 10-second auth timer
Client sends: { type: "auth", payload: { sessionId: "xxx" } }
Server validates session, responds: { type: "auth:success" } or { type: "auth:error" }
```

**Token-in-URL Warning**: Avoid passing session IDs in the WebSocket URL path or query string, as these can appear in server logs and browser history. Use the authentication message approach instead.

### 5.2 Session Validation for WebSocket

**Same Validation Logic**: WebSocket session validation uses the same logic as HTTP middleware - hash the session ID, look it up, check expiration.

**Connection Data Storage**: After successful authentication, store user ID, session ID, and member flags in the WebSocket connection's data object (Bun's `ws.data`).

**Restaurant Context**: WebSocket connections are typically scoped to a restaurant. The auth message should include `restaurantId`, which is validated against the user's memberships. Store restaurant flags in connection data.

### 5.3 Handling Session Expiry During Active WebSocket Connection

**Heartbeat with Session Check**: Implement a heartbeat mechanism (every 30-60 seconds) that both:
- Keeps the connection alive (prevents idle disconnects)
- Validates the session is still active
- Extends the session expiry (counts as user activity)

**Server-Side Expiry Check**: On each WebSocket message received, check if the session is still valid. If expired, send an error message and close the connection.

**Graceful Disconnection**: When session expires:
1. Send `{ type: "session:expired" }` message to client
2. Allow 5 seconds for client to receive
3. Close WebSocket connection with code 4001 (custom: session expired)

**Client Reconnection**: The client should handle disconnection by redirecting to login or attempting to re-authenticate if they have a refresh mechanism.

### 5.4 Room-Based Subscriptions per Restaurant

**Restaurant Rooms**: Each restaurant has a WebSocket "room" that clients join after authentication. Room name format: `restaurant:{restaurantId}`.

**Permission-Based Room Access**: Before joining a room, validate the user has at least `RESTAURANT_VIEW_MENU` for that restaurant.

**Event Scoping**: All events are scoped to rooms. A menu update in Restaurant A only goes to clients in Room A.

**Room Events**:
- `menu:updated` - Menu item created/updated/deleted
- `order:new` - New order received
- `order:updated` - Order status changed
- `staff:changed` - Staff member added/removed/modified

---

## 6. Security Considerations

### 6.1 Session Hijacking Prevention

**Secure Session ID Generation**: Use `crypto.getRandomValues()` to generate session IDs with at least 128 bits (32 bytes) of entropy. Never use predictable values like timestamps or sequential IDs.

**HTTPS Only**: All production traffic must use HTTPS. Session IDs transmitted over HTTP can be intercepted.

**Session Binding** (optional enhancement): Bind sessions to client fingerprints (IP address, user agent hash). If these change significantly, require re-authentication. Be cautious with IP binding on mobile networks where IPs change frequently.

**Short-Lived Sessions**: The 21-hour expiry with sliding extension balances usability and security. Users who are actively working get extended sessions; abandoned sessions expire quickly.

### 6.2 Brute Force Protection

**Login Rate Limiting**: Implement progressive delays after failed login attempts:
- After 3 failures: 30-second delay
- After 5 failures: 2-minute delay
- After 10 failures: Account temporarily locked (30 minutes)

**Rate Limit by Multiple Factors**: Track failures by IP address AND by email address. This prevents distributed attacks and targeted attacks.

**CAPTCHA Integration**: After 3 failed attempts from the same IP, require CAPTCHA verification.

**Account Lockout Notifications**: Notify users via email when their account is locked due to failed attempts.

### 6.3 Session Fixation Prevention

**New Session on Login**: Always generate a new session ID when a user logs in, even if they had a previous session. Never accept a client-provided session ID.

**New Session on Privilege Change**: When user roles/permissions change, or when they change their password, invalidate existing session and create new one.

**No URL-Based Sessions**: Never accept session IDs from URL parameters.

### 6.4 Secure Session ID Generation

**Algorithm**: Use Bun's crypto module:
```typescript
crypto.getRandomValues(new Uint8Array(32))
```
Convert to URL-safe base64 for transmission.

**Storage Hashing**: Store sessions as:
```typescript
SHA-256(sessionId + serverSecret)
```
This means even database compromise does not expose usable session IDs.

**No Predictable Patterns**: Session IDs must pass randomness tests. Avoid patterns, timestamps, or user-related data in the ID.

### 6.5 Additional Security Measures

**Audit Logging**: Log all authentication events (login, logout, session creation/revocation) with timestamps, IP addresses, and user agents. Store securely for forensic analysis.

**Anomaly Detection**: Monitor for unusual patterns:
- Multiple simultaneous sessions from different geographic regions
- Rapid session creation/destruction
- Unusual API access patterns

**Security Headers**: On HTTP responses, include:
- `Strict-Transport-Security` for HTTPS enforcement
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

---

## 7. Error Handling Strategy

### 7.1 Auth-Specific Error Codes

Define consistent error codes for authentication failures:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_MISSING_CREDENTIALS` | 400 | Email or password not provided |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email/password combination incorrect |
| `AUTH_ACCOUNT_LOCKED` | 403 | Account temporarily locked due to failed attempts |
| `AUTH_ACCOUNT_DISABLED` | 403 | Account has been disabled by administrator |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `SESSION_REQUIRED` | 401 | No session ID provided |
| `SESSION_INVALID` | 401 | Session ID not found or malformed |
| `SESSION_EXPIRED` | 401 | Session has expired |
| `SESSION_REVOKED` | 401 | Session was explicitly revoked |
| `PERMISSION_DENIED` | 403 | User lacks required permissions |
| `RESTAURANT_ACCESS_DENIED` | 403 | User not a member of this restaurant |
| `RATE_LIMITED` | 429 | Too many requests, try again later |

### 7.2 Permission Denied Responses

When permission checks fail, provide helpful but not overly revealing errors:

**Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this action",
    "requiredPermissions": ["RESTAURANT_EDIT_MENU"]
  }
}
```

**Security Note**: Do not reveal which specific permission the user is missing in production, as this can help attackers map out the permission structure. Only include `requiredPermissions` in development mode.

### 7.3 Session Expired Responses

**HTTP Response**:
```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Your session has expired. Please log in again."
  }
}
```

**WebSocket Message**:
```json
{
  "type": "error",
  "payload": {
    "code": "SESSION_EXPIRED",
    "message": "Your session has expired",
    "action": "redirect_to_login"
  }
}
```

### 7.4 Error Response Consistency

All error responses follow the established pattern from backend-organization.md:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Validation Errors** include field-level details:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Must be at least 8 characters"]
    }
  }
}
```

---

## 8. Database Schema Requirements

### 8.1 Users Table

Stores user accounts with global member flags:

- `id` (UUID, primary key)
- `email` (VARCHAR(255), unique, indexed)
- `password_hash` (VARCHAR(255))
- `name` (VARCHAR(100))
- `member_flags` (BIGINT UNSIGNED, default 0)
- `status` (ENUM: active, disabled, pending_verification)
- `email_verified_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, nullable, for soft delete)

### 8.2 Sessions Table

Stores active and historical sessions:

- `id` (UUID, primary key)
- `hashed_session_id` (VARCHAR(64), unique, indexed)
- `user_id` (UUID, foreign key to users)
- `device_info` (JSON - user agent, device type, etc.)
- `ip_address` (VARCHAR(45) - supports IPv6)
- `created_at` (TIMESTAMP)
- `last_activity_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP, indexed for cleanup queries)
- `revoked_at` (TIMESTAMP, nullable)

### 8.3 Restaurants Table

Stores restaurant/tenant information:

- `id` (UUID, primary key)
- `name` (VARCHAR(100))
- `description` (TEXT, nullable)
- `settings` (JSON)
- `timezone` (VARCHAR(50))
- `currency` (VARCHAR(3))
- `status` (ENUM: active, suspended)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, nullable)

### 8.4 Memberships Table

Junction table linking users to restaurants with permissions:

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `restaurant_id` (UUID, foreign key to restaurants)
- `restaurant_flags` (BIGINT UNSIGNED, default 0)
- `role_name` (VARCHAR(50) - for display: "Owner", "Manager", "Staff")
- `joined_at` (TIMESTAMP)
- `invited_by_user_id` (UUID, nullable, foreign key to users)
- UNIQUE constraint on (user_id, restaurant_id)

### 8.5 Login Attempts Table (for rate limiting)

Tracks failed login attempts:

- `id` (UUID, primary key)
- `email` (VARCHAR(255), indexed)
- `ip_address` (VARCHAR(45), indexed)
- `attempted_at` (TIMESTAMP)
- `success` (BOOLEAN)

---

## 9. Implementation Sequence

The recommended order for implementing this phase:

1. **Database migrations** - Create all tables with proper indexes
2. **Permission constants** - Define all flag constants in a central file
3. **Session service** - Create, validate, extend, revoke sessions
4. **Session middleware** - Request interception and context population
5. **Auth handlers** - Login, logout, register, me endpoints
6. **Permission middleware** - Permission checking factory
7. **User handlers** - Profile management endpoints
8. **Restaurant handlers** - Restaurant CRUD with ownership
9. **Membership handlers** - Staff management
10. **WebSocket authentication** - WS session validation
11. **Rate limiting** - Login protection
12. **Testing** - Comprehensive auth flow tests

---

## Summary

This plan establishes a robust authentication and authorization foundation for the HeroRestaurant platform. Key architectural decisions include:

- **Session-based auth over JWT** for better revocation control and server-side session management
- **21-hour sliding expiration** balancing security with user experience
- **64-bit bitwise permission flags** for efficient, flexible permission checking
- **Two-tier permission model** separating global member capabilities from restaurant-specific access
- **WebSocket session validation** with heartbeat-based expiry checking
- **Comprehensive security measures** following OWASP recommendations

The design follows the established layered architecture from backend-organization.md, with handlers, services, and repositories each having clear responsibilities.

---

## References

- OWASP Session Management Cheat Sheet
- Express Session Middleware patterns
- Session Management Best Practices (WorkOS, Stytch)
- Bit Field Role-Based Access Control implementations
- WebSocket Architecture Best Practices (Ably)
- Multi-tenant RBAC patterns (Auth0, Aserto, Permit.io)

---

## Critical Files for Implementation

- `docs/general-rules/backend-organization.md` - Core architecture patterns to follow
- `backend/src/constants/permissions.ts` (to be created) - Permission flag definitions
- `backend/src/middleware/session.middleware.ts` (to be created) - Session validation logic
- `backend/src/services/auth.service.ts` (to be created) - Core authentication business logic
