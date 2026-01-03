# WEBSOCKET CLIENT KNOWLEDGE BASE

**Parent:** `../AGENTS.md` | **Backend Protocol:** `../../../backend/src/websocket/AGENTS.md`

---

## OVERVIEW

Custom WebSocket client with authentication, reconnection, and request/response correlation.

**Pattern:** Singleton client with Jotai state integration
**Protocol:** Matches backend WebSocket protocol exactly
**Reconnection:** Exponential backoff with jitter

---

## STRUCTURE

```
websocket/
├── client.ts           # WebSocketClient singleton
├── types.ts            # Message type definitions (mirrors backend)
├── reconnection.ts     # Exponential backoff strategy
└── index.ts            # Public exports
```

---

## CLIENT USAGE

### Import
```typescript
import { wsClient } from '@/websocket';
```

### Connection Flow
```typescript
// 1. After REST login success
const { session } = await authService.login(email, password);

// 2. Connect WebSocket with session token
await wsClient.connect(session.id);

// 3. Client auto-authenticates and updates atoms
// connectionStatusAtom → 'authenticated'
```

### Send Request
```typescript
// Returns promise that resolves on response
const response = await wsClient.send({
  category: 'menu',
  action: 'list',
  payload: { restaurantId },
});

// Timeout: 30 seconds default
// Throws on error response or timeout
```

### Disconnect
```typescript
wsClient.disconnect();
// Clears pending requests, resets connection state
```

---

## REQUEST/RESPONSE CORRELATION

### How It Works
```
1. Client sends request with unique ID
2. Promise stored in pendingRequestsAtom Map
3. Server responds with matching requestId
4. Client resolves promise with response data
5. Pending request removed from Map
```

### Timeout Handling
- **Default:** 30 seconds
- **On timeout:** Promise rejected, pending request removed
- **Error message:** "Request timeout"

### Example
```typescript
// Client code
try {
  const data = await wsClient.send({
    category: 'restaurant',
    action: 'create',
    payload: { name: 'New Restaurant' },
  });
  console.log('Created:', data);
} catch (error) {
  console.error('Failed:', error.message);
}
```

---

## RECONNECTION STRATEGY

### Exponential Backoff
```
Attempt 1: 1s
Attempt 2: 2s
Attempt 3: 4s
Attempt 4: 8s
Attempt 5: 16s
Attempt 6: 30s (capped)
Attempt 7+: 30s
```

### Jitter
±30% random to prevent thundering herd.

```typescript
// Base delay with jitter
const delay = baseDelay * (0.7 + Math.random() * 0.6);
```

### Max Attempts
- **10 attempts** before giving up
- User can manually retry

### Conditions for Reconnection
- Only if session token available
- Not if user manually disconnected
- Resets counter on successful connection

---

## STATE MANAGEMENT (Jotai)

### Connection State Atom
```typescript
connectionStatusAtom: 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticating'
  | 'authenticated'
  | 'reconnecting'
```

### Derived Atoms (see atoms/AGENTS.md)
```typescript
isConnectedAtom          // connected || authenticated
isAuthenticatedWSAtom    // authenticated
isReconnectingAtom       // reconnecting
isConnectionHealthyAtom  // authenticated
```

### Non-React Updates
Client updates atoms via `getDefaultStore()`:

```typescript
import { getDefaultStore } from 'jotai';
import { connectionStatusAtom } from '@/atoms/websocketAtoms';

const store = getDefaultStore();
store.set(connectionStatusAtom, 'authenticated');
```

---

## MESSAGE TYPES (types.ts)

### Mirrors Backend Types
```typescript
// Request
interface WSRequest {
  id: string;
  type: 'request';
  category: WSMessageCategory;
  action: string;
  payload: unknown;
  timestamp: string;
}

// Response (success)
interface WSSuccessResponse<T> {
  id: string;
  type: 'response';
  requestId: string;
  success: true;
  data: T;
  timestamp: string;
}

// Response (error)
interface WSErrorResponse {
  id: string;
  type: 'error';
  requestId: string;
  success: false;
  error: WSError;
  timestamp: string;
}

// Server push event
interface WSEvent<T> {
  id: string;
  type: 'event';
  category: WSMessageCategory;
  event: string;
  payload: T;
  timestamp: string;
}
```

---

## HEARTBEAT

### Ping/Pong
- Client sends `system.ping` every **25 seconds**
- Server responds with `system.pong`
- Keeps connection alive
- Detects stale connections

### Implementation
```typescript
// Auto-started on authentication
setInterval(() => {
  wsClient.send({
    category: 'system',
    action: 'ping',
    payload: { clientTime: new Date().toISOString() },
  });
}, 25000);
```

---

## HOOKS INTEGRATION

### useWebSocket Hook
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { status, isConnected, isAuthenticated } = useWebSocket();
  
  return (
    <div>
      Status: {status}
      {!isConnected && <button onClick={reconnect}>Reconnect</button>}
    </div>
  );
}
```

### useWSRequest Hook (Custom)
```typescript
import { useWSRequest } from '@/hooks/useWSRequest';

function MenuList() {
  const { data, isLoading, error } = useWSRequest({
    category: 'menu',
    action: 'list',
    payload: { restaurantId },
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <MenuCards menus={data} />;
}
```

---

## EVENT HANDLING

### Server Push Events
```typescript
// Client receives event from server
{
  type: 'event',
  category: 'session',
  event: 'session-expired',
  payload: { reason: 'expired', message: '...' },
}

// Client handler
wsClient.on('event', (event) => {
  if (event.event === 'session-expired') {
    // Logout user, redirect to login
    handleSessionExpired(event.payload);
  }
});
```

### Event Types
- `session-expired` — Session invalidated
- `member-updated` — User's role/permissions changed
- `restaurant-updated` — Restaurant settings changed

---

## ANTI-PATTERNS

- ❌ NEVER send requests before authentication → Check `isAuthenticatedWSAtom`
- ❌ NEVER ignore reconnection → Use automatic reconnect
- ❌ NEVER mutate pending requests Map → Immutable updates
- ❌ NEVER skip error handling → Always try/catch
- ❌ NEVER create multiple clients → Singleton only

---

## CONVENTIONS

- Use `wsClient.send()` for all requests
- Handle errors with try/catch
- Update UI based on `connectionStatusAtom`
- Use hooks for React integration
- Store session token in localStorage (not atoms)

---

## NOTES

- WebSocket URL: `ws://localhost:3000/ws` (dev)
- Session token passed in initial authentication
- Connection survives page navigation (within session)
- Reconnects automatically on network issues
- Maximum 10 reconnection attempts
