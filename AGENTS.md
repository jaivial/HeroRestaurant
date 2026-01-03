# HERO RESTAURANT - PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-03 23:06 | **Commit:** 6078a8f | **Branch:** main

---

## ⚠️ MANDATORY DOCUMENTATION

**READ BEFORE CODING:**
- `docs/general-rules/frontend-organization.md` — Three-layer architecture, hooks, Jotai atoms
- `docs/general-rules/styling.md` — Apple aesthetic, liquid glass, Jotai theming
- `docs/general-rules/reusable-components.md` — UI component inventory
- `docs/general-rules/backend-organization.md` — Layered architecture, services, repositories

---

## OVERVIEW

Multi-tenant restaurant management SaaS. Slack-like workspace model with bitwise permission system.

**Stack:**
- Backend: Bun + Elysia + MySQL 8 + Kysely
- Frontend: React 19 + Vite 7 + Jotai + Tailwind 4
- Real-time: WebSocket (custom protocol) + REST API

---

## STRUCTURE

```
hero-restaurant/
├── backend/         # Bun runtime, Elysia framework, MySQL, Kysely
├── frontend/        # React 19, Vite, Jotai state, Tailwind
├── docs/            # ⚠️ AUTHORITATIVE architecture rules
└── guides/          # Phase implementation plans
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Auth flow | `backend/src/services/auth.service.ts` | REST login → WS authenticate |
| Permissions | `backend/src/constants/permissions.ts` | 64-bit bitwise flags |
| State management | `frontend/src/atoms/` | Jotai atoms by domain |
| WebSocket protocol | `backend/src/websocket/` + `frontend/src/websocket/` | Custom request-response |
| UI components | `frontend/src/components/ui/` | 21 reusable components |
| Database schema | `backend/src/database/migrations/` | 8 migration files |
| API types | `backend/src/types/api.types.ts` + `frontend/src/types/` | Mirrored DTOs |
| Three-layer examples | `frontend/src/pages/MenuCreator/` | Complete page structure |

---

## CRITICAL RULES (Summary)

### Frontend (see docs/general-rules/frontend-organization.md)

**Three-Layer Architecture (MANDATORY):**
```
Page → Functional → UI
```

| Layer | Contains | Returns | Forbidden |
|-------|----------|---------|-----------|
| Page | Hooks ONLY | Functional Components | useState, inline handlers |
| Functional | Hooks allowed | UI Components | Business logic |
| UI | Props ONLY | Pure JSX | Hooks, logic |

**Jotai State:**
- One value = one atom (granular, NEVER monolithic)
- Derived atoms for computed values
- Action atoms for mutations

**Performance:**
- React.memo() on ALL UI components
- useMemo for expensive computations, object/array props
- useCallback for handlers passed to children

### Styling (see docs/general-rules/styling.md)

**Apple Aesthetic:**
- Border radius: `2.2rem` (cards), `1rem` (buttons)
- Glass: `backdrop-blur-[20px] saturate-[180%]`
- Touch targets: min `44x44px`
- Font: Apple system stack (San Francisco)

**Theme Management:**
- Use `themeAtom` conditionals: `theme === 'dark' ? '...' : '...'`
- **NEVER** use `dark:` Tailwind prefix
- **NEVER** use `prefers-color-scheme`

**Accessibility:**
- WCAG AA: 4.5:1 contrast ratio
- Focus states on all interactive elements
- Labels on all inputs

### Backend (see docs/general-rules/backend-organization.md)

**Layered Architecture (MANDATORY):**
```
Handler → Service → Repository → Database
```

- Handlers: Validate + call services + format response
- Services: ALL business logic + transactions
- Repositories: Kysely queries ONLY

**Conventions:**
- Use `Errors.*` constants, never raw throw
- Soft delete: `deleted_at`, never hard delete
- Transactions: Wrap multi-table operations
- BigInt: Serialize as strings for JSON

---

## CONVENTIONS

### Response Format (Unified)
```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total } }

// Error
{ success: false, error: { code, message, details? } }
```

### Naming
- **Frontend:** PascalCase components, camelCase hooks, camelCase atoms
- **Backend:** kebab-case files, PascalCase classes, camelCase functions
- **Types:** DTOs end with `DTO`, interfaces match domain entities

### Data Serialization
- **BigInt → String:** All permission flags serialized for JSON
- **Date → ISO String:** All timestamps in ISO 8601
- **snake_case → camelCase:** DB columns to API DTOs

### Session Management
- 21-hour sliding expiry (extends if activity > 1h since last update)
- SHA-256 hashed session IDs (never store plaintext)
- Multiple concurrent sessions supported

---

## ANTI-PATTERNS

### Frontend
- ❌ NEVER use `dark:` Tailwind prefix → Use `themeAtom` conditionals
- ❌ NEVER use `useState` in Page components → Use custom hooks
- ❌ NEVER use hooks in UI components → Props only
- ❌ NEVER create monolithic atoms → Granular (one value = one atom)
- ❌ NEVER skip React.memo() on UI components → Always wrap

### Backend
- ❌ NEVER put business logic in handlers or repositories → Services only
- ❌ NEVER skip permission checks in WS handlers → Every action validates
- ❌ NEVER modify `ws.data` directly → Use `setConnectionData()`
- ❌ NEVER hard delete records → Use `deleted_at`
- ❌ NEVER skip transactions for multi-table ops → Always wrap

### Security
- ❌ NEVER store session tokens in atoms → localStorage only
- ❌ NEVER store plaintext session IDs in DB → SHA-256 hash
- ❌ NEVER skip CORS validation → Whitelist origins
- ❌ NEVER expose internal errors to client → Generic messages

---

## COMMANDS

```bash
# Backend
cd backend
bun install
bun db:migrate      # Run migrations
bun db:seed         # Seed system roles + test data
bun dev             # Start dev server (watches for changes)

# Frontend
cd frontend
bun install
bun dev             # Vite dev server

# Database
bun db:status       # Check migration status
bun db:rollback     # Rollback last migration
bun db:setup        # Migrate + seed in one command
```

---

## TECH DEBT

- 32 `any` types in frontend (need strict typing)
- 40+ `console.log` debug statements (remove for production)
- No automated tests (unit/integration needed)
- Manual DTO type sync (consider code generation)

---

## NOTES

- **Multi-tenant model:** Shared database, shared tables (Slack-like workspaces)
- **Permission system:** 64-bit flags (43 member flags, 32 feature flags)
- **WebSocket categories:** auth, user, restaurant, member, role, menu, dish, section, settings, system
- **Frontend routing:** `/w/:workspaceId/*` for workspace routes
- **Database:** MySQL 8+ required (JSON columns, CTEs, window functions)
