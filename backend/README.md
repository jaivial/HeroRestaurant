# HeroRestaurant Backend

Multi-tenant restaurant management system backend built with Bun, MySQL, and Kysely.

## Tech Stack

- **Runtime**: Bun
- **Database**: MySQL 8+
- **Query Builder**: Kysely (type-safe)
- **Validation**: Zod
- **Authentication**: JWT (jose library)
- **Password Hashing**: Argon2

## Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   ├── seeds/           # Development seeds
│   │   ├── connection.ts    # MySQL pool
│   │   ├── kysely.ts        # Kysely instance
│   │   ├── migrator.ts      # Migration runner
│   │   └── seeder.ts        # Seed runner
│   ├── types/
│   │   └── database.ts      # Database type definitions
│   ├── constants/
│   │   └── permissions.ts   # Permission flags system
│   └── config/
├── package.json
├── tsconfig.json
└── .env.example
```

## Database Schema

### Phase 1: Authentication, Multi-Tenancy, and Access Control

The database implements a "Shared Database, Shared Tables" multi-tenancy model with Slack-like workspace memberships.

**Core Tables**:
- `users` - Global user accounts
- `restaurants` - Tenant workspaces
- `roles` - Permission templates (system and custom)
- `memberships` - User-restaurant relationships
- `sessions` - Authentication sessions (21-hour sliding expiry)
- `login_attempts` - Brute force protection

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### 3. Setup Database

```bash
# Run all migrations
bun db:migrate

# Seed system roles
bun db:seed

# Or run both at once
bun db:setup
```

### 4. Verify Setup

```bash
# Check migration status
bun db:status
```

## Database Commands

```bash
# Migrations
bun db:migrate      # Run all pending migrations
bun db:rollback     # Rollback last migration
bun db:status       # Show migration status

# Seeds
bun db:seed         # Run all seed files

# Setup (migrations + seeds)
bun db:setup        # Run migrations then seeds
```

## Permission System

The system uses 64-bit BIGINT bitwise flags for efficient permission storage.

### Two Types of Flags

1. **Member Access Flags** - What a member can DO in a workspace
   - Stored in: `memberships.access_flags`, `users.global_flags`
   - Examples: `CAN_VIEW_ORDERS`, `CAN_EDIT_MENU`, `CAN_MANAGE_MEMBERS`

2. **Restaurant Feature Flags** - What features are ENABLED for a tenant
   - Stored in: `restaurants.feature_flags`
   - Examples: `FEATURE_INVENTORY`, `FEATURE_ONLINE_ORDERING`

### Built-in System Roles

- **Owner** - Full control (can delete restaurant)
- **Admin** - Nearly full control
- **Manager** - Operations, orders, staff, inventory
- **Chef** - Kitchen-focused permissions
- **Server** - Order creation and table management
- **Cashier** - Payment processing
- **Viewer** - Read-only access

### Usage Examples

```typescript
import { MEMBER_FLAGS, hasFlag, combineFlags } from '@/constants/permissions';

// Check if member can view orders
const canView = hasFlag(membership.access_flags, MEMBER_FLAGS.CAN_VIEW_ORDERS);

// Create custom role with multiple permissions
const customRole = combineFlags(
  MEMBER_FLAGS.CAN_VIEW_ORDERS,
  MEMBER_FLAGS.CAN_CREATE_ORDERS,
  MEMBER_FLAGS.CAN_VIEW_MENU
);

// Check if restaurant has feature enabled
import { RESTAURANT_FEATURES } from '@/constants/permissions';
const hasInventory = hasFlag(restaurant.feature_flags, RESTAURANT_FEATURES.FEATURE_INVENTORY);
```

## Architecture Pattern

The backend follows a layered architecture:

```
Routes/Handlers → Services → Repositories → Database
```

- **Handlers**: Validate input, call services, format responses
- **Services**: Business logic, orchestrate repositories, manage transactions
- **Repositories**: Database queries only (Kysely)

## Environment Variables

Required variables (see `.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database connection
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)

## Type Safety

All database tables have TypeScript types generated in `src/types/database.ts`:

```typescript
import type { User, NewUser, UserUpdate } from '@/types/database';

// Kysely provides type-safe queries
const user = await db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', 'user@example.com')
  .executeTakeFirst(); // Returns User | undefined
```

## Next Steps

After database setup:

1. Create HTTP handlers and routes
2. Implement authentication service
3. Build session middleware
4. Add permission checking middleware
5. Implement user/restaurant/membership CRUD operations

## Documentation

- [Database Plan](../guides/phase1/database-plan.md) - Detailed schema design
- [Backend Organization](../docs/general-rules/backend-organization.md) - Coding patterns

## License

Proprietary
