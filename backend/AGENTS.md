# BACKEND KNOWLEDGE BASE

**See also:** `../docs/general-rules/backend-organization.md` (AUTHORITATIVE)

---

## STACK

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Bun | Latest |
| Framework | Elysia | Latest |
| Database | MySQL | 8+ |
| Query Builder | Kysely | Type-safe |
| Validation | Zod | Schema-based |
| Auth | jose (JWT) | - |
| Passwords | Argon2 | Bun native |

---

## LAYERED ARCHITECTURE (MANDATORY)

```
Routes/Handlers → Services → Repositories → Database
```

### Layer Responsibilities

| Layer | Role | Allowed | Forbidden |
|-------|------|---------|-----------|
| **Handler** | Validate + call service + format | Zod validation, service calls | Business logic, DB queries |
| **Service** | Business logic + transactions | All logic, repo orchestration | Direct DB access |
| **Repository** | Database queries ONLY | Kysely queries | Business logic, validation |

### Example Flow
```typescript
// 1. Handler validates
const result = loginSchema.safeParse(payload);
if (!result.success) throw Errors.VALIDATION_ERROR;

// 2. Call service
const { user, session } = await AuthService.login(result.data);

// 3. Return formatted response
return { success: true, data: { user, session } };
```

---

## STRUCTURE

```
backend/src/
├── index.ts                 # Entry point (Elysia setup)
├── routes/                  # REST endpoints
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── restaurant.routes.ts
│   └── upload.routes.ts
├── services/                # Business logic (ALL logic here)
│   ├── auth.service.ts
│   ├── session.service.ts
│   ├── user.service.ts
│   ├── restaurant.service.ts
│   ├── membership.service.ts
│   ├── role.service.ts
│   ├── permission.service.ts
│   └── image.service.ts
├── repositories/            # Kysely queries ONLY
│   ├── user.repository.ts
│   ├── session.repository.ts
│   ├── restaurant.repository.ts
│   ├── membership.repository.ts
│   ├── role.repository.ts
│   └── menu.repository.ts
├── websocket/               # WebSocket server (see websocket/AGENTS.md)
│   ├── server.ts
│   ├── handlers/
│   ├── middleware/
│   └── state/
├── database/                # Database setup (see database/AGENTS.md)
│   ├── connection.ts
│   ├── kysely.ts
│   ├── migrations/
│   └── seeds/
├── middleware/
│   ├── session.middleware.ts
│   ├── permission.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── error.middleware.ts
├── types/
│   ├── database.types.ts    # Kysely table types
│   ├── api.types.ts         # Request/response DTOs
│   ├── auth.types.ts
│   ├── websocket.types.ts
│   └── context.ts
├── constants/
│   └── permissions.ts       # 64-bit bitwise flags
├── utils/
│   ├── errors.ts            # AppError class + Errors.* constants
│   ├── response.ts          # success(), error() helpers
│   ├── password.ts          # Argon2 hash/verify
│   ├── session-id.ts        # Crypto ID generation
│   └── transformers.ts      # DB → DTO converters
└── config/
    ├── env.ts               # Environment validation
    └── cors.ts              # CORS config
```

---

## WHERE TO LOOK

| Task | File |
|------|------|
| Add REST endpoint | `src/routes/*.routes.ts` |
| Add WebSocket handler | `src/websocket/handlers/*.handler.ts` |
| Add business logic | `src/services/*.service.ts` |
| Add database query | `src/repositories/*.repository.ts` |
| Add migration | `src/database/migrations/` |
| Permission flags | `src/constants/permissions.ts` |
| Error definitions | `src/utils/errors.ts` |
| DTO transformers | `src/utils/transformers.ts` |

---

## CONVENTIONS

### Error Handling
```typescript
// Use predefined errors from Errors.*
throw Errors.UNAUTHORIZED;
throw Errors.FORBIDDEN;
throw Errors.NOT_FOUND('User');

// Never raw throw
throw new Error('Not found'); // ❌ WRONG
```

### Transactions
```typescript
// Wrap multi-table operations
const result = await db.transaction().execute(async (trx) => {
  const user = await UserRepository.create(trx, userData);
  const membership = await MembershipRepository.create(trx, memberData);
  return { user, membership };
});
```

### Soft Delete
```typescript
// Mark as deleted, never hard delete
await db
  .updateTable('users')
  .set({ deleted_at: new Date() })
  .where('id', '=', userId)
  .execute();
```

### DTO Transformation
```typescript
// Always transform DB entities to DTOs
const dbUser = await UserRepository.findById(id);
const userDTO = transformers.toUserDTO(dbUser);
return userDTO; // camelCase, serialized BigInt
```

---

## PERMISSION SYSTEM

### 64-bit Bitwise Flags

**Member Access Flags (43 flags):** What a member can DO
```typescript
MEMBER_FLAGS.CAN_VIEW_DASHBOARD
MEMBER_FLAGS.CAN_VIEW_ORDERS
MEMBER_FLAGS.CAN_EDIT_MENU
MEMBER_FLAGS.CAN_MANAGE_MEMBERS
```

**Restaurant Feature Flags (32 flags):** What features are ENABLED
```typescript
RESTAURANT_FEATURES.FEATURE_INVENTORY
RESTAURANT_FEATURES.FEATURE_ONLINE_ORDERING
```

### Check Permissions
```typescript
import { hasFlag, hasAllFlags, hasAnyFlag } from '@/constants/permissions';

// Single flag
if (!hasFlag(membership.access_flags, MEMBER_FLAGS.CAN_EDIT_MENU)) {
  throw Errors.FORBIDDEN;
}

// All flags required
if (!hasAllFlags(flags, [FLAG_A, FLAG_B, FLAG_C])) {
  throw Errors.FORBIDDEN;
}

// Any flag sufficient
if (!hasAnyFlag(flags, [FLAG_X, FLAG_Y])) {
  throw Errors.FORBIDDEN;
}
```

---

## ANTI-PATTERNS

- ❌ NEVER put business logic in handlers → Services only
- ❌ NEVER put business logic in repositories → Queries only
- ❌ NEVER skip permission checks in handlers → Every action validates
- ❌ NEVER hard delete → Use soft delete (`deleted_at`)
- ❌ NEVER skip transactions for multi-table ops → Always wrap
- ❌ NEVER expose internal errors → Generic messages to client
- ❌ NEVER use raw throw → Use `Errors.*` constants
- ❌ NEVER store plaintext passwords → Argon2 hash
- ❌ NEVER store plaintext session IDs → SHA-256 hash

---

## COMMANDS

```bash
# Development
bun dev              # Watch mode with auto-restart

# Database
bun db:migrate       # Run pending migrations
bun db:rollback      # Rollback last migration
bun db:seed          # Run seed files
bun db:setup         # Migrate + seed
bun db:status        # Check migration status

# Scripts
bun scripts/create-root-user.ts    # Create system admin
```

---

## NOTES

- Session expiry: 21 hours sliding (extends on activity)
- Session IDs: SHA-256 hashed in database
- BigInt serialization: Automatic via `BigInt.prototype.toJSON`
- CORS: Whitelist from `env.CORS_ORIGIN`
- WebSocket: Registered in `index.ts` via Elysia plugin
