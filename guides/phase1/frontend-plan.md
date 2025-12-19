# Frontend Plan - Phase 1: Authentication, Sessions, and Real-Time Integration

## 1. Overview

This phase establishes the foundational security and real-time infrastructure for the HeroRestaurant SaaS application. The frontend will implement a robust session-based authentication system with automatic session extension, multi-workspace support for restaurant management, granular permission controls using ULONG flags, and real-time WebSocket integration for live updates.

The system must handle multiple concurrent scenarios: users managing multiple restaurants, staff with varying permission levels across workspaces, real-time order updates, and seamless session management that balances security with user experience. This phase is critical because every subsequent feature depends on knowing WHO the user is, WHICH workspace they are operating in, and WHAT they are permitted to do.

---

## 2. Authentication Flow Analysis

### 2.1 Login Page and Process

The login experience must be immediate and confidence-inspiring. When a user lands on the login page, they should encounter a clean, minimal interface following the Apple aesthetic with liquid glass effects.

**Pre-Login State Detection**: Before rendering the login form, the application must check if an existing valid session exists. This prevents the jarring experience of showing a login page to an already-authenticated user. The check happens on route initialization, and if a valid session exists, the user should be redirected to their last active workspace dashboard.

**Login Form Requirements**: The form captures email and password. Email validation happens client-side with immediate feedback. Password field includes a visibility toggle. A "Remember this device" option extends session duration for trusted devices. Social login buttons (if implemented) appear below the primary form.

**Login Submission Flow**: When the user submits credentials, the frontend sends a POST to `/auth/login`. The backend validates credentials and returns a session response. On success, the session ID is stored (httpOnly cookie preferred, or secure storage fallback). The frontend then calls `/auth/me` to retrieve full user data including workspaces and permissions. The user is redirected to their default workspace dashboard.

**Login Error Handling**: Invalid credentials show a generic "Invalid email or password" message (never reveal which field is wrong). Rate limiting triggers a cooldown message. Account lockout explains the situation and provides recovery options. Network errors show retry options with exponential backoff.

### 2.2 Session Storage Strategy

**Primary Strategy - httpOnly Cookies**: The session ID should be stored in an httpOnly cookie set by the backend. This provides the strongest security against XSS attacks because JavaScript cannot access httpOnly cookies. The cookie should have the Secure flag (HTTPS only), SameSite=Strict or Lax, and appropriate domain/path settings.

**Fallback Strategy - Secure Storage**: If cookies are unavailable (rare edge cases, certain embedded contexts), the session ID can be stored in sessionStorage. This is less secure but acceptable for non-critical applications. NEVER use localStorage for session IDs as it persists indefinitely and is vulnerable to XSS.

**Session ID Format**: The session ID should be opaque to the frontend - a random string that maps to session data on the backend. The frontend never stores or inspects the actual session data, only the session ID.

**Cookie vs Token Trade-offs**: Cookies are automatically sent with every request to the same origin, reducing frontend code complexity. However, they complicate cross-origin scenarios. For this application, since the frontend and backend share the same origin (or are configured for proper CORS), cookies are preferred.

### 2.3 Protected Route Implementation

Every route except public pages (login, forgot password, public menu viewer) must be protected. Protection means verifying the session is valid before rendering the route content.

**Route Protection Layers**:
1. **Route Definition Level**: Routes are marked as public or protected in the route configuration
2. **Route Guard Component**: A wrapper component that intercepts navigation and validates sessions
3. **Layout Level**: The authenticated layout includes session validation in its initialization

**What "Protected" Means**: A protected route requires a valid, non-expired session. Additionally, some routes require specific permissions. The protection logic must verify session validity AND permission requirements before allowing access.

**Loading During Protection Check**: While validating the session on route change, the UI shows a minimal loading state - not a full-page spinner, but a subtle indication that navigation is in progress. This prevents content flash and provides feedback.

### 2.4 Logout Process

Logout is both a security operation and a UX moment. It must be thorough and clear.

**Logout Steps**:
1. User triggers logout (button click or session timeout)
2. Frontend calls `/auth/logout` to invalidate the server-side session
3. Frontend clears the session cookie (if possible) or signals backend to clear it
4. Frontend clears ALL client-side state: Jotai atoms reset to initial values
5. WebSocket connection is explicitly closed
6. Any cached data (if using service workers) is invalidated
7. User is redirected to login page
8. Browser history is managed to prevent "back button" access to protected content

**Simultaneous Device Logout**: When a user logs out, only the current session is invalidated. Other devices remain logged in unless the user explicitly requests "logout all devices" or the backend implements single-session enforcement.

### 2.5 Session Recovery on Page Refresh

Page refresh or tab restoration must seamlessly restore the authenticated state without requiring re-login.

**Recovery Flow**:
1. Application initializes with session state as "unknown"
2. Immediately call `/auth/me` to validate existing session (from cookie)
3. If valid: hydrate user state, load workspace context, connect WebSocket
4. If invalid: redirect to login, clear any stale client state
5. Show minimal loading UI during this check (not a blank page)

**First-Load Optimization**: The session recovery should be the first thing that happens on app load, before any other data fetching. This prevents waterfall requests where features fetch data only to discover the session is invalid.

---

## 3. Route Middleware Design

### 3.1 Intercepting All Route Changes

Every navigation event - whether from clicking a link, using browser back/forward, or programmatic navigation - must pass through session validation.

**React Router Integration**: Using React Router (or similar), implement a route change listener that fires BEFORE the new route renders. This can be done through route loaders, beforeEach guards, or a wrapper component.

**Navigation Types to Intercept**:
- Internal link clicks
- Browser back/forward buttons
- URL bar navigation (partial - cannot intercept direct URL entry, but can validate on render)
- Programmatic navigation (useNavigate)
- External redirects to the app

### 3.2 Calling /auth/me on Navigation

The session validation endpoint `/auth/me` is the source of truth for session validity. It returns the current user if the session is valid, or an error if invalid.

**When to Call /auth/me**:
- On every protected route navigation (initial design)
- Optimization: Skip if last call was within X seconds and no activity gap detected
- On app initialization / page refresh
- After returning from background (tab visibility change)

**Request Strategy**: The `/auth/me` call should include the session cookie automatically (httpOnly cookies are sent with same-origin requests). The endpoint validates the session, extends its expiry, and returns user data.

**Optimization Consideration**: Calling `/auth/me` on EVERY navigation may be excessive. Consider:
- Caching the last validation result with a timestamp
- Only re-validating after N seconds of inactivity or on specific triggers
- Using a lightweight ping endpoint that just validates without returning full user data

However, for maximum security, especially in a multi-tenant restaurant application handling sensitive business data, validating on every navigation is the safest approach.

### 3.3 Handling Async Validation

Navigation should not complete until session validation resolves. This prevents flash of unauthorized content.

**Implementation Pattern**:
1. User initiates navigation
2. Route guard intercepts before render
3. Async validation call begins
4. Show route-level loading indicator (not full page)
5. On success: allow navigation to complete, update session atoms
6. On failure: abort navigation, redirect to login

**Race Condition Handling**: If the user rapidly navigates between routes, ensure only the latest validation matters. Cancel or ignore results from stale navigation attempts.

### 3.4 Loading States During Validation

The loading state must be perceptible but not disruptive. Two approaches:

**Approach A - Route-Level Loading**: Replace the destination page content with a skeleton or spinner until validation completes. This is safer but can feel slower.

**Approach B - Overlay Loading**: Show the previous page with a subtle overlay or progress indicator. Navigate only after validation. This feels faster but risks showing stale content.

**Recommended**: Use Approach A for initial app load and workspace switches. Use Approach B for same-workspace navigation where the risk of invalid session is lower.

### 3.5 Redirect Logic for Invalid Sessions

When a session is invalid, the user must be redirected to login with context preserved.

**Redirect Data to Preserve**:
- The URL they were trying to access (for post-login redirect)
- Any query parameters
- The workspace they were in (if applicable)

**Redirect Implementation**:
1. Store intended destination in session storage or URL parameter
2. Redirect to `/login?redirect=/intended/path`
3. After successful login, read redirect parameter and navigate
4. Clear redirect data after use

**Avoiding Redirect Loops**: If the user is already on the login page, do not redirect again. If the redirect target itself requires auth and keeps failing, show an error instead of looping.

---

## 4. Permission System on Frontend

### 4.1 Storing Permission Flags in Jotai Atoms

Permissions are represented as ULONG flags - unsigned 64-bit integers where each bit represents a specific permission. This allows efficient storage and checking of up to 64 distinct permissions.

**Permission Atom Structure**:
- `userPermissionsAtom`: The raw ULONG permission flags for the current user in the current workspace
- `workspaceRoleAtom`: The user's role in the current workspace (for display purposes)
- Individual derived atoms for specific permission checks

**Why ULONG Flags**: Bitwise operations are extremely fast. Checking if a user has permission X is a simple AND operation: `(userPermissions & PERMISSION_X) !== 0n`. This is more efficient than array lookups or string comparisons.

**Permission Data Flow**:
1. User logs in -> backend returns base user data
2. User selects workspace -> backend returns workspace-specific permissions
3. Permissions stored in atom
4. Components read permissions via hooks
5. Workspace switch -> permissions atom updated with new workspace permissions

### 4.2 Permission Checking Utilities

Create a set of utility functions and hooks for permission checks.

**Core Permission Check Function**: Takes the permission flags and a required permission, returns boolean. Uses bitwise AND to check if the permission bit is set.

**Compound Permission Checks**:
- `hasAllPermissions(flags, [PERM_A, PERM_B])` - User must have ALL listed permissions
- `hasAnyPermission(flags, [PERM_A, PERM_B])` - User must have AT LEAST ONE permission
- `hasExactPermissions(flags, [PERM_A, PERM_B])` - User must have EXACTLY these permissions

**Permission Hook**: `usePermission(permission)` - Returns boolean indicating if current user has the permission. This hook reads from the permissions atom and performs the check.

**Multiple Permission Hook**: `usePermissions([permissions])` - Returns an object mapping each permission to its status, reducing multiple atom reads.

### 4.3 Conditional Rendering Based on Permissions

UI elements should appear or hide based on permissions. This is UX improvement, not security - backend must still enforce permissions.

**Permission Gate Component**: A wrapper component that renders children only if the user has the required permission. Otherwise renders nothing or a fallback.

**Usage Patterns**:
- Entire sections hidden if no permission
- Buttons disabled (not hidden) if no permission but visible context
- Menu items filtered by permission
- Form fields read-only based on permission

**Avoid "Hidden but Present" Anti-pattern**: Do not hide elements with CSS while keeping them in the DOM. Use conditional rendering to completely remove unauthorized elements.

### 4.4 Route Guards for Permission-Protected Pages

Some pages require not just authentication but specific permissions.

**Permission Route Guard**: Similar to auth route guard, but checks permissions after session validation.

**Guard Configuration**: Routes define required permissions in their configuration:
```
/orders -> requires: VIEW_ORDERS
/orders/create -> requires: CREATE_ORDERS
/settings/users -> requires: MANAGE_USERS
```

**Permission Validation Flow**:
1. Route change detected
2. Session validated (as described above)
3. Required permissions read from route config
4. Current user permissions checked
5. If permitted: render route
6. If not permitted: show 403 page or redirect

### 4.6 ACL System Based on accessFlags

The Access Control List (ACL) system leverages ULONG bitwise permission flags (accessFlags) to provide granular route protection. This system integrates with the existing permission atoms and route middleware.

**AccessFlags System Overview**: Each member has an `accessFlags` field (ULONG) where each bit represents a specific permission. Routes are protected by specifying which accessFlags are required for access.

**Permission Flag Constants**: Define all permission flags as BigInt constants:
```typescript
// utils/permissions.ts
export const PERMISSIONS = {
  VIEW_ORDERS: 1n << 0n,      // Bit 0
  CREATE_ORDERS: 1n << 1n,    // Bit 1
  EDIT_ORDERS: 1n << 2n,      // Bit 2
  DELETE_ORDERS: 1n << 3n,    // Bit 3
  VIEW_MENU: 1n << 4n,        // Bit 4
  EDIT_MENU: 1n << 5n,        // Bit 5
  VIEW_INVENTORY: 1n << 6n,   // Bit 6
  MANAGE_INVENTORY: 1n << 7n, // Bit 7
  VIEW_STAFF: 1n << 8n,       // Bit 8
  MANAGE_STAFF: 1n << 9n,     // Bit 9
  VIEW_ANALYTICS: 1n << 10n,  // Bit 10
  MANAGE_SETTINGS: 1n << 11n, // Bit 11
  // ... up to 64 permissions
} as const;
```

**Route Configuration with Required Flags**: Routes specify which permissions are required and the combination logic:
```typescript
// routes/config.ts
export const ROUTE_CONFIG = {
  '/w/:workspaceId/orders': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_ORDERS],
    permissionMode: 'all', // 'all' or 'any'
  },
  '/w/:workspaceId/orders/create': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.CREATE_ORDERS],
    permissionMode: 'all',
  },
  '/w/:workspaceId/settings/users': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.MANAGE_STAFF],
    permissionMode: 'all',
  },
  '/w/:workspaceId/analytics': {
    requiresAuth: true,
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.VIEW_ORDERS],
    permissionMode: 'any', // User needs either permission
  },
};
```

**ACL Middleware/Guard Implementation**: The route guard checks accessFlags before rendering:
```typescript
// guards/AclGuard.tsx
function AclGuard({ children, route }: AclGuardProps) {
  const [userPermissions] = useAtom(rawPermissionsAtom);
  const routeConfig = ROUTE_CONFIG[route];

  if (!routeConfig) {
    return children; // No config = no restrictions
  }

  const hasAccess = routeConfig.permissionMode === 'all'
    ? hasAllPermissions(userPermissions, routeConfig.requiredPermissions)
    : hasAnyPermission(userPermissions, routeConfig.requiredPermissions);

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
```

**Permission Checking Utilities**: Helper functions for bitwise flag operations:
```typescript
// utils/permissions.ts
export function hasPermission(userFlags: bigint, permission: bigint): boolean {
  return (userFlags & permission) === permission;
}

export function hasAllPermissions(userFlags: bigint, permissions: bigint[]): boolean {
  return permissions.every(perm => hasPermission(userFlags, perm));
}

export function hasAnyPermission(userFlags: bigint, permissions: bigint[]): boolean {
  return permissions.some(perm => hasPermission(userFlags, perm));
}

export function addPermission(userFlags: bigint, permission: bigint): bigint {
  return userFlags | permission;
}

export function removePermission(userFlags: bigint, permission: bigint): bigint {
  return userFlags & ~permission;
}
```

**Integration with Permission Atoms**: The ACL system reads from existing permission atoms:
```typescript
// atoms/permissionAtoms.ts
export const rawPermissionsAtom = atom<bigint>(0n);

// Derived atoms for common checks
export const canManageOrdersAtom = atom((get) => {
  const flags = get(rawPermissionsAtom);
  return hasAllPermissions(flags, [PERMISSIONS.VIEW_ORDERS, PERMISSIONS.EDIT_ORDERS]);
});

export const canAccessSettingsAtom = atom((get) => {
  const flags = get(rawPermissionsAtom);
  return hasPermission(flags, PERMISSIONS.MANAGE_SETTINGS);
});
```

**Route Protection Examples**:

*Example 1 - Single Permission Required*:
```typescript
// /orders requires VIEW_ORDERS flag
{
  path: '/w/:workspaceId/orders',
  element: (
    <AclGuard route="/w/:workspaceId/orders">
      <OrdersPage />
    </AclGuard>
  ),
}
```

*Example 2 - Multiple Permissions (ALL required)*:
```typescript
// /settings/users requires MANAGE_STAFF flag
{
  path: '/w/:workspaceId/settings/users',
  element: (
    <AclGuard route="/w/:workspaceId/settings/users">
      <UserManagementPage />
    </AclGuard>
  ),
}
```

*Example 3 - Multiple Permissions (ANY required)*:
```typescript
// /analytics requires VIEW_ANALYTICS OR VIEW_ORDERS
{
  path: '/w/:workspaceId/analytics',
  element: (
    <AclGuard route="/w/:workspaceId/analytics">
      <AnalyticsPage />
    </AclGuard>
  ),
}
```

**Component-Level Permission Checks**: Use hooks for fine-grained UI control:
```typescript
function OrdersToolbar() {
  const [permissions] = useAtom(rawPermissionsAtom);
  const canCreate = hasPermission(permissions, PERMISSIONS.CREATE_ORDERS);
  const canDelete = hasPermission(permissions, PERMISSIONS.DELETE_ORDERS);

  return (
    <div>
      {canCreate && <Button>New Order</Button>}
      {canDelete && <Button variant="danger">Delete Selected</Button>}
    </div>
  );
}
```

**Permission Loading on Auth/Workspace Switch**: Permissions are fetched and stored as bigint:
```typescript
// On login or workspace switch
const response = await fetch('/auth/me'); // or workspace switch endpoint
const userData = await response.json();

// Backend returns accessFlags as string representation of ULONG
const accessFlags = BigInt(userData.member.accessFlags);
set(rawPermissionsAtom, accessFlags);
```

**Debugging and Development**: Helper utilities for permission debugging:
```typescript
export function permissionsToArray(flags: bigint): string[] {
  const result: string[] = [];
  Object.entries(PERMISSIONS).forEach(([name, value]) => {
    if (hasPermission(flags, value)) {
      result.push(name);
    }
  });
  return result;
}

// Usage in dev tools
console.log('User permissions:', permissionsToArray(userPermissions));
// Output: ['VIEW_ORDERS', 'CREATE_ORDERS', 'VIEW_MENU', 'EDIT_MENU']
```

### 4.5 Handling "Access Denied" Scenarios

When a user lacks permission, the response must be helpful, not cryptic.

**403 Page Design**: A dedicated "Access Denied" page that:
- Clearly states what permission is missing (if not a security risk)
- Suggests who to contact for access
- Provides navigation back to permitted areas
- Does NOT expose what the forbidden content would have been

**Graceful Degradation**: Some features should degrade rather than block:
- View-only mode for data they can see but not edit
- Summary view instead of detailed view
- Redirect to the closest permitted alternative

**Audit Logging**: Permission denials should be logged for security monitoring, but this is a backend concern. Frontend just needs to handle the response.

---

## 5. Workspace Management

### 5.1 Workspace Context Design

A workspace represents a restaurant in the multi-tenant system. Users can belong to multiple workspaces with different roles in each.

**Workspace Atom Structure**:
- `availableWorkspacesAtom`: List of workspaces the user has access to
- `currentWorkspaceAtom`: The currently selected workspace
- `workspaceLoadingAtom`: Loading state during workspace operations
- `workspacePermissionsAtom`: Permissions specific to the current workspace

**Workspace Data Model**:
- Workspace ID (UUID)
- Workspace name (restaurant name)
- User's role in this workspace
- User's permissions in this workspace
- Workspace metadata (logo, settings, timezone, etc.)

**Initial Workspace Selection**: On login, the user should land in their "default" workspace. This could be:
- The last workspace they used (stored in backend session)
- Their primary/home workspace (marked in user profile)
- The first workspace alphabetically (fallback)

### 5.2 Workspace Switcher Component

The workspace switcher is always accessible from the main navigation. It allows quick switching between restaurants.

**Switcher UI Design**:
- Dropdown or modal showing all available workspaces
- Current workspace clearly indicated
- Search/filter for users with many workspaces
- Recent workspaces section for quick access
- Visual indication of role/permissions in each workspace

**Switcher Placement**: In the top navigation bar, accessible from every page. The current workspace name should always be visible.

### 5.3 Data Refresh on Workspace Switch

Switching workspaces means switching data context. All workspace-specific data must refresh.

**What Resets on Workspace Switch**:
- Orders, inventory, menu items (workspace-specific data)
- Permissions (different per workspace)
- WebSocket room subscriptions
- Any cached workspace data

**What Persists Across Workspace Switch**:
- User identity
- Session validity
- Theme preference
- UI preferences (sidebar state, etc.)

**Switch Flow**:
1. User selects new workspace
2. Show loading state
3. Call backend to switch context (may need explicit endpoint or just passing workspace ID)
4. Update `currentWorkspaceAtom`
5. Clear workspace-specific atom data
6. Fetch new workspace permissions
7. Reconnect/resubscribe WebSocket to new workspace rooms
8. Navigate to workspace dashboard (or stay on current page if it exists in new workspace)

### 5.4 Permission Reload per Workspace

Permissions are workspace-specific. A user might be Admin in Restaurant A but Viewer in Restaurant B.

**Permission Fetch Strategy**: Permissions should be fetched as part of the workspace switch operation. The backend endpoint that confirms workspace switch should return the new permissions.

**Permission Atom Update**: On workspace switch, the permission atoms reset and populate with new values. Any components relying on permissions will automatically re-render and adjust their visibility/behavior.

**Edge Case - Permission Loss**: If switching to a workspace where the user has fewer permissions, they might be on a page they can no longer access. The route guard should handle this by redirecting to a permitted page.

### 5.5 URL Structure for Workspaces

The workspace context should be reflected in the URL for shareability and bookmarkability.

**Option A - Workspace in Path**: `/workspace/:workspaceId/orders`
- Pro: Clear context, easy routing
- Con: Longer URLs, complex nested routing

**Option B - Workspace as Subdomain**: `restaurant-a.herorestaurant.com/orders`
- Pro: Clean URLs, automatic context
- Con: Complex DNS/SSL setup, harder local development

**Option C - Workspace in State Only**: `/orders` with workspace in atom
- Pro: Simple URLs
- Con: Not shareable, back button issues

**Recommended**: Option A (workspace in path) provides the best balance. URLs like `/w/:workspaceId/dashboard` or `/r/:restaurantSlug/orders` are clear and shareable.

**Implementation**: The workspace ID or slug should be extracted from the URL and used to set the workspace context. If the URL workspace differs from the current workspace atom, trigger a workspace switch.

---

## 6. Activity Detection and Session Extension

### 6.1 What Events Trigger "Activity"

Activity detection determines when to extend the session and when to consider the user idle.

**High-Confidence Activity Signals**:
- API calls (any request to the backend)
- Form submissions
- Button clicks
- Keyboard input in form fields

**Medium-Confidence Activity Signals**:
- Page navigation within the app
- Scroll events (debounced)
- Mouse movement (heavily debounced)

**Low-Confidence Signals (Generally Ignore)**:
- Mouse hovering without clicking
- Window focus without interaction
- Passive viewing without interaction

**Recommended Activity Definition**: Treat API calls and explicit user interactions (clicks, keyboard input) as activity. Ignore passive signals like mouse movement to avoid extending sessions for idle-but-present users.

### 6.2 Debouncing Activity Detection

Activity signals can be frequent. Debouncing prevents excessive processing and API calls.

**Debounce Strategy**:
- Group activity signals within a time window (e.g., 30 seconds)
- Only trigger one "activity registered" event per window
- Reset the debounce timer on each activity signal

**Activity Registration**: Activity can be "registered" locally (update a timestamp in state) without calling the server. The server session extension happens via `/auth/me` calls which already happen on navigation.

**Heartbeat Alternative**: Instead of extending on every activity, send periodic heartbeats (every 5-10 minutes) while the user is active. If no activity in a period, skip the heartbeat.

### 6.3 Idle Timeout Warnings

Users should be warned before their session expires due to inactivity.

**Idle Detection Logic**:
- Track last activity timestamp
- Periodically check if idle duration exceeds threshold
- Threshold should be less than session expiry (e.g., warn at 18 hours if session is 21 hours)

**Warning UI**:
- Modal dialog that appears over current content
- Message: "Your session will expire soon due to inactivity"
- Options: "Stay Logged In" (extends session) or "Log Out Now"
- Countdown timer showing time until expiry
- Auto-dismiss if user takes action elsewhere

**Warning Timing**: Warn when 80-90% of session duration has passed without activity. For a 21-hour session, warn around 17-19 hours of inactivity.

### 6.4 Auto-Logout on Extended Inactivity

If the user does not respond to the warning, log them out automatically.

**Auto-Logout Flow**:
1. Warning displayed
2. User does not respond within grace period (e.g., 5 minutes)
3. Automatic logout triggered
4. Session cleared locally
5. WebSocket disconnected
6. Redirect to login with message "Your session expired due to inactivity"

**Grace Period**: The warning should appear with enough time for the user to respond. If session expires in 1 hour, show warning at that point with a 5-minute grace period.

**Multi-Tab Consideration**: If the user is active in another tab, they should not be logged out. Use BroadcastChannel or localStorage events to communicate activity across tabs.

### 6.5 User Notification Before Expiry

Beyond the modal warning, consider additional notification mechanisms.

**Notification Options**:
- In-app toast notification (less intrusive than modal)
- Browser notification (if permitted)
- Email notification for very long sessions (backend concern)

**Notification Timing**:
- First notification: 30 minutes before expiry
- Urgent notification: 5 minutes before expiry
- Final warning: 1 minute before expiry

**User Preference**: Allow users to configure notification preferences (or disable if they prefer to manage themselves).

---

## 7. WebSocket Integration

### 7.1 Connection Management with Session

WebSocket connections must be authenticated using the same session as HTTP requests.

**Connection Establishment**:
1. App initializes, session validated via `/auth/me`
2. If session valid, initiate WebSocket connection
3. Send authentication message with session token
4. Backend validates, associates connection with user/session
5. Connection ready for subscriptions

**Session Token for WebSocket**: Since httpOnly cookies are not accessible to JavaScript, the WebSocket authentication needs a different approach:
- Option A: Include session ID as query parameter on connection (less secure)
- Option B: Request a short-lived WebSocket token via HTTP, use for WS auth (more secure)
- Option C: Use cookie-based authentication if WebSocket is same-origin (automatic)

**Recommended**: Option C if possible (same-origin WebSocket). Otherwise, Option B with a dedicated token endpoint.

### 7.2 Automatic Reconnection Strategy

Network interruptions happen. The WebSocket must reconnect seamlessly.

**Reconnection Triggers**:
- Connection dropped (network error)
- Server closes connection (maintenance, scaling)
- Tab returns from background (after browser suspension)
- Session extension/refresh

**Reconnection Logic**:
- Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
- Maximum retry attempts: 10 (then show error to user)
- Reconnect on visibility change (tab becomes visible)
- Reset backoff on successful connection

**State During Reconnection**: UI should indicate connection status subtly (e.g., indicator in header). Queue outgoing messages and send after reconnection. Mark incoming data as potentially stale.

### 7.3 Room Subscription per Workspace

WebSocket rooms/channels organize real-time updates. Each workspace has its own room.

**Room Naming Convention**: `workspace:{workspaceId}` for workspace-wide updates, `workspace:{workspaceId}:orders` for specific features.

**Subscription Flow**:
1. WebSocket connected and authenticated
2. Send room join message for current workspace
3. Backend validates user has access to workspace
4. Connection added to room's subscriber list
5. Receive real-time updates for that workspace

**Workspace Switch Room Management**:
1. User switches workspace
2. Send room leave message for old workspace
3. Send room join message for new workspace
4. Update local subscription tracking

### 7.4 Real-Time State Updates

Real-time events from WebSocket must integrate with Jotai atoms smoothly.

**Event Types and Handlers**:
- `order:created` -> Add to orders atom
- `order:updated` -> Update in orders atom
- `order:deleted` -> Remove from orders atom
- `inventory:low` -> Update inventory atom, show notification
- `menu:updated` -> Refresh menu data

**Optimistic Update Reconciliation**: If the app uses optimistic updates, WebSocket events may confirm or conflict with optimistic state. The reconciliation logic should:
- For confirmations: Replace optimistic data with server data
- For conflicts: Show notification, revert optimistic change

**State Freshness**: Real-time updates ensure data stays fresh without polling. However, on reconnection, consider fetching latest state to catch any events missed during disconnection.

### 7.5 Handling WebSocket Auth Failures

WebSocket authentication can fail if the session expired between HTTP validation and WS connection.

**Auth Failure Response**:
1. Backend sends `auth:failed` message
2. Frontend closes WebSocket
3. Attempt session refresh via `/auth/me`
4. If refresh succeeds, reconnect WebSocket
5. If refresh fails, redirect to login

**Graceful Degradation**: If WebSocket cannot connect but HTTP works, the app should still function (just without real-time updates). Show a status indicator and fall back to polling for critical data.

---

## 8. State Management Strategy

### 8.1 Auth State Atoms

Authentication state is the foundation. All other state depends on knowing the user.

**Auth Atoms**:
- `authStatusAtom`: 'unknown' | 'authenticated' | 'unauthenticated'
- `currentUserAtom`: User object or null
- `sessionExpiryAtom`: Timestamp of session expiry (for countdown)
- `lastActivityAtom`: Timestamp of last user activity

**Auth Atom Initialization**: On app load, `authStatusAtom` starts as 'unknown'. After `/auth/me` call resolves, it becomes 'authenticated' or 'unauthenticated'.

### 8.2 Workspace State Atoms

Workspace state determines the data context.

**Workspace Atoms**:
- `availableWorkspacesAtom`: Array of workspaces user can access
- `currentWorkspaceIdAtom`: String ID of current workspace
- `currentWorkspaceAtom`: Derived atom with full workspace object
- `workspaceSwitchingAtom`: Boolean for loading state during switch

**Workspace Atom Dependencies**: Workspace atoms depend on auth atoms. If `authStatusAtom` becomes 'unauthenticated', workspace atoms should reset.

### 8.3 Permission Atoms

Permissions are workspace-specific and frequently accessed.

**Permission Atoms**:
- `rawPermissionsAtom`: ULONG permission flags
- Individual derived atoms for common permission checks (e.g., `canManageOrdersAtom`, `canEditMenuAtom`)

**Permission Atom Design**: Use derived atoms for frequently checked permissions. This provides memoization - the bitwise check only runs when `rawPermissionsAtom` changes.

### 8.4 Session Status Atoms

Session status for UI indicators and logic.

**Session Status Atoms**:
- `sessionValidAtom`: Boolean, derived from auth status
- `sessionCheckingAtom`: Boolean, true during validation calls
- `sessionWarningAtom`: Boolean, true when showing expiry warning
- `idleDurationAtom`: Derived from `lastActivityAtom`

### 8.5 How Atoms Interact

Atoms should have clear dependency relationships to avoid circular dependencies and ensure predictable updates.

**Atom Dependency Graph**:
```
authStatusAtom (root)
  -> currentUserAtom (depends on auth)
  -> availableWorkspacesAtom (depends on currentUser)
     -> currentWorkspaceIdAtom (depends on available)
        -> currentWorkspaceAtom (derived from id + available)
        -> rawPermissionsAtom (depends on workspace)
           -> canManageOrdersAtom (derived)
           -> canEditMenuAtom (derived)
```

**Update Cascades**: When `authStatusAtom` changes to 'unauthenticated', all dependent atoms should reset. Jotai handles this automatically for derived atoms. For writable atoms, implement reset logic.

---

## 9. Page Structure

### 9.1 Auth Pages

**Login Page** (`/login`):
- Public page, no auth required
- Glass card with login form centered
- Email and password inputs
- "Remember me" checkbox
- "Forgot password" link
- Submit button with loading state
- Error messages below form
- Optional: social login buttons

**Forgot Password Page** (`/forgot-password`):
- Public page
- Email input to receive reset link
- Success message after submission
- Link back to login

**Reset Password Page** (`/reset-password/:token`):
- Public page with token validation
- New password and confirm password inputs
- Password strength indicator
- Success message and redirect to login

### 9.2 Dashboard Layout with Workspace Context

**Authenticated Layout**:
- Sidebar navigation (collapsible)
- Top header with workspace switcher, user menu, notifications
- Main content area
- Toast/notification container

**Workspace-Aware Navigation**:
- Current workspace name in header
- Navigation items filtered by permissions
- Workspace switcher dropdown
- Visual indicator of workspace role

**Dashboard Page** (`/w/:workspaceId/dashboard`):
- Overview statistics for the workspace
- Quick actions based on permissions
- Recent activity feed
- Real-time updates via WebSocket

### 9.3 Navigation Based on Permissions

**Navigation Item Configuration**: Each navigation item specifies required permission. Items without permission are hidden.

**Navigation Sections**:
- Dashboard (always visible if authenticated)
- Orders (requires VIEW_ORDERS)
- Menu Management (requires VIEW_MENU)
- Inventory (requires VIEW_INVENTORY)
- Staff Management (requires MANAGE_USERS)
- Settings (requires MANAGE_SETTINGS)
- Analytics (requires VIEW_ANALYTICS)

**Dynamic Navigation**: Navigation should re-render when permissions change (workspace switch). Use Jotai atoms to drive navigation visibility.

### 9.4 Error Pages

**403 Forbidden Page**:
- Glass card with lock icon
- "Access Denied" heading
- Explanation of what permission is needed
- "Return to Dashboard" button
- Contact admin suggestion

**Session Expired Page** (or redirect to login with message):
- Explanation that session timed out
- Login form or link to login
- Option to remember where they were going

**500 Error Page**:
- "Something went wrong" message
- Retry button
- Contact support link

**404 Not Found Page**:
- "Page not found" message
- Search bar (optional)
- Link to dashboard

---

## 10. Responsive Layout System

### 10.1 General Layout Architecture

The authenticated application uses a responsive layout system that adapts to different screen sizes with an emphasis on mobile-first design and thumb-reachability on mobile devices.

**Layout Components**:
- `AuthenticatedLayout`: Root layout wrapper for all authenticated pages
- `Sidebar`: Navigation sidebar with collapsible behavior
- `TopHeader`: Header with workspace switcher, user menu, notifications
- `MainContent`: Content area that adjusts based on sidebar state
- `MobileNavOverlay`: Full-height overlay sidebar for mobile

**Layout Structure**:
```tsx
<AuthenticatedLayout>
  <TopHeader />
  <div className="layout-container">
    <Sidebar /> {/* Hidden on mobile by default */}
    <MainContent>
      {children} {/* Page content */}
    </MainContent>
  </div>
  <MobileNavOverlay /> {/* Shown when hamburger is tapped */}
</AuthenticatedLayout>
```

### 10.2 Desktop Layout Behavior

On desktop viewports (2xl breakpoint and above: ≥1024px), the sidebar is always visible and occupies a fixed width on the left side.

**Desktop Layout Specifications**:
- Sidebar width: 280px (fixed)
- Sidebar position: Fixed on the left, full height
- Content area: Fills remaining width to the right
- Sidebar is not collapsible (always visible)
- Smooth transitions for hover effects and active states

**Desktop Implementation**:
```tsx
// Desktop layout (≥1024px)
<div className="hidden 2xl:flex h-screen">
  {/* Sidebar - always visible */}
  <aside className="w-[280px] h-full glass border-r border-white/10">
    <SidebarContent />
  </aside>

  {/* Content area */}
  <main className="flex-1 overflow-y-auto">
    <TopHeader />
    <div className="p-6">
      {children}
    </div>
  </main>
</div>
```

**Glass Styling on Desktop**: Sidebar uses liquid glass effect following styling.md:
```tsx
className="
  backdrop-blur-glass backdrop-saturate-glass
  bg-white/70 dark:bg-black/50
  border-r border-white/20 dark:border-white/10
  shadow-glass dark:shadow-glass-dark
"
```

### 10.3 Mobile Layout Behavior

On mobile viewports (<1024px), the sidebar is completely hidden by default. A floating hamburger menu button appears in the bottom-right corner for optimal thumb reach.

**Mobile Layout Specifications**:
- Sidebar: Hidden by default (display: none)
- Hamburger button: Fixed position in bottom-right corner
- Hamburger position: 24px from bottom, 24px from right
- Content area: Full width (100vw)
- Top header: Simplified, shows workspace name and essential actions

**Mobile Implementation**:
```tsx
// Mobile layout (<1024px)
<div className="2xl:hidden">
  {/* Simplified header */}
  <TopHeader variant="mobile" />

  {/* Full-width content */}
  <main className="w-full min-h-screen p-4">
    {children}
  </main>

  {/* Floating hamburger button */}
  <button
    onClick={() => setSidebarOpen(true)}
    className="
      fixed bottom-6 right-6
      w-14 h-14 rounded-full
      glass shadow-glass-lg
      flex items-center justify-center
      z-40
      hover:scale-110 transition-transform
    "
  >
    <HamburgerIcon className="w-6 h-6" />
  </button>
</div>
```

**Why Bottom-Right Placement**: Research shows bottom-right is the most comfortable position for thumb reach on modern large-screen smartphones, especially for right-handed users (70-80% of population).

### 10.4 Mobile Sidebar Overlay

When the hamburger button is tapped, the sidebar slides in as a full-height overlay covering the content.

**Overlay Sidebar Specifications**:
- Position: Fixed overlay (z-index: 50)
- Width: 280px or 80% of screen width (whichever is smaller)
- Height: Full viewport height (100vh)
- Animation: Slide in from left with 300ms transition
- Backdrop: Semi-transparent overlay (rgba(0,0,0,0.5))
- Dismiss triggers: Tap outside sidebar, tap hamburger again, navigate to new route

**Overlay Implementation**:
```tsx
// Mobile sidebar overlay
{isSidebarOpen && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 z-40 2xl:hidden"
      onClick={() => setSidebarOpen(false)}
    />

    {/* Sidebar panel */}
    <aside
      className={`
        fixed left-0 top-0 bottom-0 z-50
        w-[280px] max-w-[80vw]
        glass shadow-glass-lg
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        2xl:hidden
      `}
    >
      {/* Close button at top */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 w-8 h-8 glass-button rounded-full"
      >
        <XIcon className="w-4 h-4" />
      </button>

      <SidebarContent />
    </aside>
  </>
)}
```

**Overlay Glass Styling**: The overlay sidebar uses enhanced glass effect for prominence:
```tsx
className="
  backdrop-blur-glass backdrop-saturate-glass
  bg-white/90 dark:bg-black/75
  border-r border-white/20 dark:border-white/10
  shadow-glass-lg dark:shadow-glass-dark
"
```

### 10.5 Sidebar State Management with Jotai

The sidebar open/closed state is managed with a Jotai atom for reactive updates across components.

**Sidebar Atoms**:
```typescript
// atoms/layoutAtoms.ts
import { atom } from 'jotai';

// Sidebar open state (mobile only)
export const sidebarOpenAtom = atom<boolean>(false);

// Toggle atom for easy open/close
export const toggleSidebarAtom = atom(
  null,
  (get, set) => {
    const current = get(sidebarOpenAtom);
    set(sidebarOpenAtom, !current);
  }
);

// Derived atom for checking if viewport is mobile
// (Can be updated based on window resize)
export const isMobileViewportAtom = atom<boolean>(
  typeof window !== 'undefined' ? window.innerWidth < 1024 : false
);
```

**Usage in Components**:
```typescript
// Hamburger button
function HamburgerButton() {
  const [, toggle] = useAtom(toggleSidebarAtom);

  return (
    <button onClick={toggle} className="...">
      <HamburgerIcon />
    </button>
  );
}

// Sidebar overlay
function MobileSidebarOverlay() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  return isOpen ? (
    <aside>...</aside>
  ) : null;
}
```

### 10.6 Breakpoint-Aware Behavior

The layout system responds to all breakpoints defined in styling.md (xs through 6xl).

**Key Breakpoints for Layout**:
- `xs` to `xl` (280px - 768px): Mobile layout, hamburger menu
- `2xl` to `6xl` (1024px - 3000px): Desktop layout, persistent sidebar

**Intermediate Breakpoints**: Tablets (768px - 1024px) can use either pattern:
- Option A: Use mobile pattern (hamburger menu)
- Option B: Show sidebar but make it collapsible

**Recommended**: Use mobile pattern up to 1024px for consistency and maximum content space.

**Responsive Utilities**:
```typescript
// hooks/useViewport.ts
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { isMobileViewportAtom } from '@/atoms/layoutAtoms';

export function useViewport() {
  const [isMobile, setIsMobile] = useAtom(isMobileViewportAtom);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return { isMobile };
}
```

### 10.7 Content Area Behavior

The main content area adapts its width and padding based on viewport size.

**Desktop Content Area**:
- Width: `calc(100vw - 280px)` (full width minus sidebar)
- Max width: Constrained by content needs (e.g., 1400px for reading comfort)
- Padding: 24px on all sides

**Mobile Content Area**:
- Width: 100vw (full viewport width)
- Padding: 16px on all sides (conserve space)
- Max width: None (use full screen)

**Responsive Padding**:
```tsx
<main className="
  w-full
  p-4 sm:p-4 md:p-5 lg:p-6
  2xl:ml-[280px] 2xl:w-[calc(100vw-280px)]
">
  {children}
</main>
```

### 10.8 Navigation Dismissal on Route Change

When the user navigates to a new route while the mobile sidebar is open, it should automatically close.

**Auto-Dismiss Implementation**:
```typescript
// In AuthenticatedLayout component
import { useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { sidebarOpenAtom } from '@/atoms/layoutAtoms';

function AuthenticatedLayout({ children }) {
  const location = useLocation();
  const [, setSidebarOpen] = useAtom(sidebarOpenAtom);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    // ... layout JSX
  );
}
```

### 10.9 Apple Aesthetic Implementation

The layout follows Apple's design principles from styling.md.

**Glass Effects**: All sidebar and overlay components use liquid glass:
- Backdrop blur: 20px
- Saturation: 180%
- Border radius: 2.2rem for containers, 1rem for buttons
- Semi-transparent backgrounds with subtle borders

**Animation Standards**:
- Sidebar slide: 300ms ease-in-out
- Hamburger rotation: 200ms ease
- Backdrop fade: 200ms ease
- All animations use cubic-bezier for natural feel

**Touch Targets**: Minimum touch target size of 44x44px:
- Hamburger button: 56x56px (14x14 icon)
- Navigation items: 48px height minimum
- Close button: 44x44px

**Visual Hierarchy**:
```tsx
// Sidebar navigation item
<button className="
  w-full h-12 px-4
  flex items-center gap-3
  rounded-lg
  text-gray-800 dark:text-gray-200
  hover:bg-white/30 dark:hover:bg-white/10
  active:scale-95
  transition-all duration-200
">
  <Icon className="w-5 h-5" />
  <span className="font-medium">Navigation Item</span>
</button>
```

### 10.10 Accessibility Considerations

The responsive layout maintains accessibility across all devices.

**Keyboard Navigation**:
- Hamburger button: Keyboard accessible (Tab + Enter)
- Sidebar: Focus trap when open on mobile
- Escape key: Closes mobile sidebar
- Focus returns to hamburger button after close

**Screen Reader Support**:
- Hamburger button: `aria-label="Open navigation menu"`
- Sidebar overlay: `role="navigation" aria-label="Main navigation"`
- Backdrop: `aria-hidden="true"` (decorative only)

**Focus Management**:
```typescript
function MobileSidebarOverlay() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Focus first interactive element when opened
      const firstButton = sidebarRef.current.querySelector('button, a');
      (firstButton as HTMLElement)?.focus();
    }
  }, [isOpen]);

  return (
    <aside ref={sidebarRef} onKeyDown={(e) => {
      if (e.key === 'Escape') setIsOpen(false);
    }}>
      {/* Sidebar content */}
    </aside>
  );
}
```

**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
  .sidebar-overlay {
    transition-duration: 0ms;
  }
}
```

### 10.11 Complete Layout Example

Putting it all together:

```tsx
// components/layouts/AuthenticatedLayout.tsx
import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { sidebarOpenAtom } from '@/atoms/layoutAtoms';
import { TopHeader } from './TopHeader';
import { Sidebar } from './Sidebar';
import { HamburgerButton } from './HamburgerButton';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  // Auto-close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Desktop Layout */}
      <div className="hidden 2xl:flex h-screen">
        <Sidebar className="w-[280px]" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="2xl:hidden">
        <TopHeader variant="mobile" />
        <main className="min-h-screen p-4">
          {children}
        </main>
        <HamburgerButton />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 2xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={`
              fixed left-0 top-0 bottom-0 z-50
              w-[280px] max-w-[80vw]
              backdrop-blur-glass backdrop-saturate-glass
              bg-white/90 dark:bg-black/75
              border-r border-white/20 dark:border-white/10
              shadow-glass-lg
              transform transition-transform duration-300
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              2xl:hidden
            `}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}
    </div>
  );
}
```

---

## 11. UX Considerations

### 11.1 Loading States During Auth Checks

**Initial Load**: Full-screen subtle loader with app logo. Should be brief (under 2 seconds for session validation).

**Navigation Loading**: Inline progress indicator in the top navigation. Previous content remains visible but slightly dimmed or with overlay.

**Data Fetch Loading**: Skeleton loaders matching the shape of expected content. Prevent layout shift when data arrives.

### 11.2 Smooth Transitions on Workspace Switch

**Transition Animation**: When switching workspaces, animate the content transition. Fade out old content, show workspace loading state, fade in new content.

**Workspace Indicator Animation**: Animate the workspace name change in the header to draw attention to the context switch.

**Data Transition**: Clear old workspace data before showing new. Show skeletons during fetch rather than stale data.

### 11.3 Clear Feedback for Permission Denied

**Inline Permission Feedback**: When hovering over a disabled action, show tooltip explaining why it is disabled (e.g., "Requires Manager permission").

**Action Feedback**: If a user somehow triggers an action they lack permission for, show a clear toast message explaining the denial.

**Visual Permission Cues**: Use consistent visual language for "no permission" - perhaps grayed out with a subtle lock icon.

### 11.4 Session Expiry Warnings

**Warning Modal Design**:
- Non-blocking but prominent
- Clear countdown timer
- Two-button design: "Stay Logged In" (primary) and "Log Out" (secondary)
- Dismissible by clicking "Stay Logged In" or any app interaction
- Re-appears if user goes idle again

**Subtle Pre-Warning**: 30 minutes before expiry, show a subtle toast or banner that can be dismissed. This serves as an early heads-up without interrupting workflow.

---

## 12. Edge Cases and Considerations

### 12.1 Multi-Tab Behavior

**Session Sharing**: All tabs share the same session (cookies are shared). Activity in one tab should prevent logout in others.

**Activity Sync**: Use BroadcastChannel API or localStorage events to sync activity across tabs. If any tab is active, consider the user active.

**Logout Sync**: When one tab logs out, all tabs should reflect this. Use BroadcastChannel to trigger logout in other tabs.

**Workspace Sync**: If one tab switches workspace, should others follow? Two options:
- Option A: Sync workspace across tabs (simpler mental model)
- Option B: Independent workspaces per tab (more flexible for power users)

Recommended: Option B for flexibility, with visual indication of different workspace contexts.

### 12.2 Network Interruption Handling

**Offline Detection**: Monitor navigator.onLine and show offline indicator. Queue actions that require network.

**Request Retry**: Implement retry logic for failed requests (except POST/mutations - those need user confirmation).

**Reconnection**: When network returns, validate session and reconnect WebSocket.

### 12.3 Token/Session Refresh Failure

**Graceful Handling**: If session refresh fails, do not immediately log out. Show warning and offer manual refresh. Only auto-logout after multiple failures.

**Clear Error Messages**: Distinguish between "session expired" (re-login required) and "network error" (retry might work).

### 12.4 Permission Changes Mid-Session

**Scenario**: User is using the app, admin changes their permissions in backend.

**Detection**: Permissions are fetched on workspace switch and `/auth/me` calls. Changes are detected on next validation.

**Handling**: If permissions reduced while user is on a now-forbidden page, the route guard will catch this on next navigation. For immediate effect, consider WebSocket push for permission changes.

### 12.5 Concurrent Session Limits

**Business Rule**: Should users be allowed multiple simultaneous sessions (devices)?

**Single Session Enforcement**: If only one session allowed, new login invalidates previous session. Previous sessions should detect this and redirect to login.

**Multiple Session Support**: Allow multiple sessions but provide "logout all devices" option in settings.

---

## 13. Implementation Sequence

### Phase 1A - Core Auth Infrastructure
1. Auth atoms (authStatusAtom, currentUserAtom)
2. Login page and form
3. `/auth/me` integration
4. Basic protected route guard
5. Logout functionality

### Phase 1B - Session Management
6. Session recovery on page refresh
7. Activity detection hooks
8. Idle timeout warning modal
9. Auto-logout on extended inactivity
10. Multi-tab activity sync

### Phase 1C - Permission System
11. Permission atoms
12. Permission checking utilities and hooks
13. Permission gate component
14. Permission-based route guards
15. 403 Forbidden page

### Phase 1D - Workspace Management
16. Workspace atoms
17. Workspace switcher component
18. URL structure with workspace ID
19. Data refresh on workspace switch
20. Permission reload per workspace

### Phase 1E - WebSocket Integration
21. WebSocket connection manager
22. Authentication over WebSocket
23. Reconnection logic
24. Room subscription system
25. Real-time state updates integration

### Phase 1F - ACL System Implementation
26. Permission flag constants (PERMISSIONS object)
27. Permission utility functions (hasPermission, hasAllPermissions, hasAnyPermission)
28. Route configuration with permission requirements
29. AclGuard component implementation
30. Integration with existing permission atoms
31. Debugging utilities (permissionsToArray)

### Phase 1G - Responsive Layout System
32. Layout atoms (sidebarOpenAtom, toggleSidebarAtom, isMobileViewportAtom)
33. AuthenticatedLayout component with desktop/mobile variants
34. Sidebar component with glass styling
35. TopHeader component (desktop and mobile variants)
36. HamburgerButton component with bottom-right positioning
37. MobileSidebarOverlay with slide-in animation
38. Auto-dismiss on route change logic
39. useViewport hook for responsive behavior
40. Accessibility features (focus trap, keyboard navigation, screen reader support)

---

## Critical Files for Implementation

- `docs/general-rules/frontend-organization.md` - Core architecture patterns for three-layer components, Jotai atoms, and hooks organization
- `docs/general-rules/styling.md` - Glass effect styling, theme management with Jotai, and responsive design tokens
- `docs/general-rules/reusable-components.md` - Available handmade components (LoginForm, Modal, Toast, etc.)
- `docs/general-rules/backend-organization.md` - Backend WebSocket architecture, auth middleware patterns, and API response formats

---

## Summary

This plan establishes the frontend foundation for HeroRestaurant's authentication and workspace system. Key architectural decisions include:

- **Jotai atoms** for all auth, workspace, and permission state
- **Route middleware** that validates sessions on every protected navigation
- **ULONG bitwise permission flags** matching the backend system
- **ACL system** with granular route protection using accessFlags (supports ALL/ANY permission combinations)
- **Workspace-scoped URLs** for shareability and bookmarkability
- **WebSocket integration** with session-aware authentication
- **Activity detection** for intelligent session extension
- **Multi-tab coordination** using BroadcastChannel
- **Responsive layout system** with Apple aesthetic and glass effects
  - Desktop: Persistent sidebar (280px) on left, full-width content
  - Mobile: Hidden sidebar with floating hamburger button (bottom-right for thumb reach)
  - Overlay sidebar slides in from left on mobile (280px or 80% width)
  - Auto-dismisses on navigation or backdrop tap
  - Follows breakpoints from styling.md (xs through 6xl)

The design follows the established three-layer component architecture from frontend-organization.md, with clear separation between page components, functional components, and UI components. All styling adheres to the liquid glass effect specifications in styling.md with proper light/dark mode support via Jotai atoms.
