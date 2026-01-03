# WEBSOCKET KNOWLEDGE BASE

**Parent:** `../../AGENTS.md` | **Backend:** `../../../backend/AGENTS.md`

---

## OVERVIEW

Custom WebSocket protocol with request-response pattern, authentication, and real-time events.

**Transport:** Elysia native WebSocket
**Protocol:** JSON-based request-response with correlation IDs
**Categories:** auth, user, restaurant, member, role, menu, dish, section, settings, system

---

## MESSAGE PROTOCOL

### Request Format
```typescript
{
  id: string;                    // Unique request ID
  type: 'request';
  category: WSMessageCategory;   // 'auth' | 'user' | 'restaurant' | ...
  action: string;                // 'login' | 'create' | 'update' | ...
  payload: unknown;              // Action-specific data
  timestamp: string;             // ISO timestamp
}
```

### Response Format
```typescript
// Success
{
  id: string;
  type: 'response';
  requestId: string;             // Correlates to request.id
  success: true;
  data: T;
  timestamp: string;
}

// Error
{
  id: string;
  type: 'error';
  requestId: string;
  success: false;
  error: {
    code: WSErrorCode;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
```

### Server Push Events
```typescript
{
  id: string;
  type: 'event';
  category: WSMessageCategory;
  event: string;                 // 'session-expired' | 'member-updated' | ...
  payload: T;
  timestamp: string;
}
```

---

## HANDLER PATTERN

### Handler Registry
**Location:** `handlers/index.ts`

Handlers organized by domain:
```
handlers/
├── index.ts              # Message router
├── auth.handler.ts       # register, login, logout, authenticate
├── user.handler.ts       # get, update
├── restaurant.handler.ts # create, list, get, update, delete
├── member.handler.ts     # list, invite, update, remove
├── role.handler.ts       # list, create, update, delete
├── menu.handler.ts       # create, list, update, delete
└── system.handler.ts     # ping, pong
```

### Handler Signature
```typescript
type MessageHandler = (
  ws: WSConnection,
  payload: unknown
) => Promise<{
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}>;
```

### Handler Flow
```
1. Message arrives → Zod validation
2. Rate limit check (100 msgs/min)
3. Authentication check (unless PUBLIC_ACTIONS)
4. Permission validation
5. Handler execution
6. Response with requestId
```

### Example Handler
```typescript
// handlers/menu.handler.ts
export const menuHandlers = {
  create: async (ws: WSConnection, payload: CreateMenuPayload) => {
    // ws.data contains authenticated user context
    const menu = await MenuService.create(ws.data.userId, payload);
    return { data: menu };
  },
  
  list: async (ws: WSConnection, payload: ListMenuPayload) => {
    const menus = await MenuService.list(payload.restaurantId);
    return { data: menus };
  },
};
```

---

## CONNECTION STATE

### ConnectionData
```typescript
{
  connectionId: string;          // Unique connection ID
  connectedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;      // Null until authenticated
  userId: string | null;         // Null until authenticated
  globalFlags: bigint;           // User permissions
  currentRestaurantId: string | null;
  subscriptions: Set<string>;    // Subscribed channels
  messageCount: number;          // Rate limiting
  windowStart: number;           // Rate limit window
  lastPingAt: number | null;     // Heartbeat
}
```

### ConnectionManager
**Location:** `state/connections.ts`

**Singleton** that tracks all active connections.

**Methods:**
- `register(ws)` — Add new connection
- `unregister(connectionId)` — Remove connection
- `authenticate(connectionId, sessionId, userId)` — Mark as authenticated
- `deauthenticate(connectionId)` — Clear auth state
- `broadcastToUser(userId, event)` — Send to all user connections
- `broadcastToRestaurant(restaurantId, event)` — Send to all members
- `broadcastToChannel(channel, event)` — Send to subscribers
- `broadcastToAll(event)` — Send to all authenticated

---

## AUTHENTICATION FLOW

### Initial Connection
```
1. Client connects to /ws
2. Server creates ConnectionData (unauthenticated)
3. Client sends auth.authenticate with session token
4. Server validates token
5. ConnectionManager.authenticate() marks connection
6. Client receives success response
```

### Public Actions
- `auth.register`
- `auth.login`
- `auth.authenticate`
- `system.ping`

**All other actions require authentication.**

### Session Validation
Every protected action calls:
```typescript
await validateSession(ws); // middleware/session.ws.ts
```

Validates:
- Session exists in DB
- Session not expired
- Session not revoked
- Updates last_activity_at

---

## RATE LIMITING

### Message Rate Limit
- **100 messages per 60-second window** per connection
- Tracked in `ConnectionData.messageCount` and `windowStart`
- Returns `RATE_LIMITED` error if exceeded

### Login Rate Limit
- **5 login attempts per 5-minute window** per IP
- Tracked in-memory by IP address
- Cleared on successful login

---

## ERROR CODES

**Authentication:**
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_ACCOUNT_LOCKED`
- `SESSION_REQUIRED`
- `SESSION_EXPIRED`
- `WS_NOT_AUTHENTICATED`

**Permission:**
- `PERMISSION_DENIED`
- `RESTAURANT_ACCESS_DENIED`

**System:**
- `RATE_LIMITED`
- `INVALID_MESSAGE_FORMAT`
- `UNKNOWN_ACTION`
- `INTERNAL_ERROR`

---

## WHERE TO LOOK

| Task | File |
|------|------|
| Add handler | `handlers/[domain].handler.ts` |
| Add action to category | Export from domain handler |
| Add message type | `../types/websocket.types.ts` |
| Connection state | `state/connections.ts` |
| Session validation | `middleware/session.ws.ts` |
| Rate limiting | `middleware/rate-limit.ws.ts` |
| Server setup | `server.ts` |

---

## CONVENTIONS

- Handler names match action: `auth.login` → `authHandlers.login`
- Validate with Zod schemas (defined in `types/websocket.types.ts`)
- Always check permissions before mutating data
- Use ConnectionManager for broadcasts
- Store connection state via `setConnectionData()`, never mutate `ws.data`

---

## ANTI-PATTERNS

- ❌ NEVER skip session validation for protected actions
- ❌ NEVER mutate `ws.data` directly → Use `setConnectionData()`
- ❌ NEVER skip permission checks → Validate every action
- ❌ NEVER expose internal errors → Return generic error codes
- ❌ NEVER forget to broadcast updates → Notify affected users

---

## NOTES

- WebSocket registered in `src/index.ts` via Elysia plugin
- Heartbeat: Client sends `system.ping` every 25 seconds
- Reconnection: Frontend handles with exponential backoff
- Pending requests: Frontend tracks with 30s timeout
