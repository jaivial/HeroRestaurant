# DATABASE KNOWLEDGE BASE

**Parent:** `../../AGENTS.md` | **Backend:** `../../../backend/AGENTS.md`

---

## STACK

- **Database:** MySQL 8+
- **Query Builder:** Kysely (type-safe SQL)
- **Migrations:** Custom Kysely migrator
- **Seeds:** Custom seeder for development data

---

## STRUCTURE

```
database/
├── connection.ts        # MySQL connection pool
├── kysely.ts            # Kysely instance (exports `db`)
├── migrator.ts          # Migration runner
├── seeder.ts            # Seed runner
├── migrations/          # 8 migration files
│   ├── 001_create_users_table.ts
│   ├── 002_create_restaurants_table.ts
│   ├── 003_create_roles_table.ts
│   ├── 004_create_memberships_table.ts
│   ├── 005_create_sessions_table.ts
│   ├── 006_create_login_attempts_table.ts
│   ├── 007_create_menus_tables.ts
│   └── 008_create_restaurant_settings_table.ts
└── seeds/
    ├── 001_system_roles.ts
    ├── 002_test_users.ts
    └── 003_test_data.ts
```

---

## KYSELY USAGE

### Import
```typescript
import { db } from '@/database/kysely';
```

### Basic Queries
```typescript
// SELECT
const user = await db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', email)
  .where('deleted_at', 'is', null)
  .executeTakeFirst();

// INSERT
const newUser = await db
  .insertInto('users')
  .values({
    id: crypto.randomUUID(),
    email,
    password_hash,
    name,
    created_at: new Date(),
    updated_at: new Date(),
  })
  .returningAll()
  .executeTakeFirstOrThrow();

// UPDATE
await db
  .updateTable('users')
  .set({ name: newName, updated_at: new Date() })
  .where('id', '=', userId)
  .execute();

// DELETE (soft delete preferred)
await db
  .updateTable('users')
  .set({ deleted_at: new Date() })
  .where('id', '=', userId)
  .execute();
```

### Transactions
```typescript
const result = await db.transaction().execute(async (trx) => {
  const user = await trx
    .insertInto('users')
    .values(userData)
    .returningAll()
    .executeTakeFirstOrThrow();
  
  const membership = await trx
    .insertInto('memberships')
    .values({ user_id: user.id, restaurant_id, ...memberData })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return { user, membership };
});
```

### Type Safety
```typescript
import type { User, NewUser, UserUpdate } from '@/types/database.types';

// NewUser = type for INSERT (omits Generated fields)
// User = full table type
// UserUpdate = type for UPDATE (all fields optional)
```

---

## MIGRATIONS

### Creating Migrations
```typescript
// migrations/NNN_description.ts

import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('table_name')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('table_name').execute();
}
```

### Running Migrations
```bash
bun db:migrate       # Run all pending
bun db:rollback      # Rollback last
bun db:status        # Check status
```

---

## SEEDS

### Creating Seeds
```typescript
// seeds/NNN_description.ts

import { db } from '../kysely';
import { ROLE_TEMPLATES } from '@/constants/permissions';

export async function seed() {
  // Insert system roles
  const roles = Object.entries(ROLE_TEMPLATES).map(([name, permissions]) => ({
    id: crypto.randomUUID(),
    name,
    permissions,
    is_system_role: true,
    display_order: 0,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await db.insertInto('roles').values(roles).execute();
}
```

### Running Seeds
```bash
bun db:seed          # Run all seeds
bun db:setup         # Migrate + seed
```

---

## SCHEMA OVERVIEW

### Multi-Tenant Model
**Shared Database, Shared Tables** (Slack-like workspaces)

**Core Tables:**
- `users` — Global user accounts
- `restaurants` — Tenant workspaces
- `roles` — Permission templates (system + custom)
- `memberships` — User-restaurant relationships
- `sessions` — Authentication sessions (21-hour expiry)
- `login_attempts` — Brute force protection

**Menu Tables:**
- `fixed_menus` — Fixed-price menus
- `open_menus` — A la carte menus
- `menu_sections` — Menu sections (starters, mains, etc.)
- `dishes` — Menu items

**Settings:**
- `restaurant_settings` — Opening days, meal schedules

---

## CONVENTIONS

### Soft Delete
All tables have `deleted_at` column. **Never hard delete.**

```typescript
// Mark as deleted
.set({ deleted_at: new Date() })

// Filter out deleted
.where('deleted_at', 'is', null)
```

### Timestamps
All tables have `created_at` and `updated_at`.

```typescript
// On INSERT
created_at: new Date(),
updated_at: new Date(),

// On UPDATE
.set({ updated_at: new Date(), ...otherFields })
```

### UUIDs
All primary keys are UUIDs (varchar(36)).

```typescript
id: crypto.randomUUID()
```

### BigInt Columns
Permission flags stored as BIGINT UNSIGNED.

```typescript
// In migration
.addColumn('permissions', 'bigint unsigned', (col) => col.notNull().defaultTo('0'))

// In query (Kysely handles conversion)
const role = await db.selectFrom('roles').selectAll().executeTakeFirst();
// role.permissions is bigint
```

---

## ANTI-PATTERNS

- ❌ NEVER hard delete → Use soft delete
- ❌ NEVER skip timestamps → Always set created_at/updated_at
- ❌ NEVER forget transactions → Wrap multi-table ops
- ❌ NEVER use raw SQL → Use Kysely query builder
- ❌ NEVER query deleted records → Filter `deleted_at is null`
- ❌ NEVER expose DB errors → Catch and throw AppError

---

## COMMANDS

```bash
# Migrations
bun db:migrate       # Run pending migrations
bun db:rollback      # Rollback last migration
bun db:status        # Check migration status

# Seeds
bun db:seed          # Run all seed files

# Combined
bun db:setup         # Migrate + seed in one command
```

---

## NOTES

- Connection pool managed in `connection.ts`
- Environment vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Type generation: Manual (define in `types/database.types.ts`)
- MySQL 8+ required (JSON columns, CTEs, window functions)
