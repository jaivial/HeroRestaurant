# FRONTEND KNOWLEDGE BASE

**⚠️ MANDATORY READING:**
- `../docs/general-rules/frontend-organization.md` — Architecture bible (741 lines)
- `../docs/general-rules/styling.md` — Styling requirements (459 lines)
- `../docs/general-rules/reusable-components.md` — UI component inventory

---

## STACK

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19 |
| Build Tool | Vite | 7 |
| State | Jotai | Latest |
| Styling | Tailwind | 4 |
| Router | React Router | 7 |
| WebSocket | Custom client | - |

---

## THREE-LAYER ARCHITECTURE (MANDATORY)

```
┌─────────────────────────────────────────────┐
│  LAYER 1: PAGE COMPONENT                    │
│  • Custom hooks calls ONLY                  │
│  • useEffect allowed (prefer hooks)         │
│  • Returns: Functional Components           │
├─────────────────────────────────────────────┤
│  LAYER 2: FUNCTIONAL COMPONENT              │
│  • Hooks allowed                            │
│  • Returns: UI Components                   │
├─────────────────────────────────────────────┤
│  LAYER 3: UI COMPONENT                      │
│  • Props ONLY                               │
│  • NO hooks, NO logic                       │
│  • Wrapped with React.memo()                │
└─────────────────────────────────────────────┘
```

### Layer 1: Page Component

**Location:** `src/pages/[Name]/[Name].tsx`

✅ **Allowed:**
- Custom hook calls
- useEffect (but prefer hooks)
- Type imports

❌ **Forbidden:**
- useState directly
- Inline handlers
- Fetch logic
- Business logic

**Template:**
```tsx
export function Dashboard({ userId }: DashboardProps) {
  const { stats, orders, isLoading } = useDashboardData(userId);
  const { refreshData } = useDashboardActions();

  return (
    <Container>
      <StatsSection stats={stats} isLoading={isLoading} />
      <RecentOrders orders={orders} />
    </Container>
  );
}
```

### Layer 3: UI Component

**Location:** `src/components/ui/` or `src/pages/[Name]/.../ui/`

✅ **Allowed:**
- Props only
- Simple ternaries
- className/style props

❌ **Forbidden:**
- Hooks (useState, useEffect, custom)
- Logic beyond ternaries
- API calls

**Template:**
```tsx
export const OrderCard = memo(function OrderCard({ 
  order,
  className = '',
  style 
}: OrderCardProps) {
  return (
    <Card style={style} className={className}>
      <Text weight="bold">{order.customerName}</Text>
      <Badge color={order.status === 'completed' ? 'green' : 'yellow'}>
        {order.status}
      </Badge>
    </Card>
  );
});
```

---

## JOTAI STATE MANAGEMENT (MANDATORY)

### Granularization Rule
**One value = one atom**

❌ **WRONG:**
```tsx
const userAtom = atom({ id, name, email, avatar, preferences });
```

✅ **CORRECT:**
```tsx
const userIdAtom = atom<string>('');
const userNameAtom = atom<string>('');
const userEmailAtom = atom<string>('');
const userAvatarAtom = atom<string>('');
```

### Atom Types

**Base Atoms:**
```tsx
export const menuItemsAtom = atom<MenuItem[]>([]);
```

**Derived Atoms:**
```tsx
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price, 0);
});
```

**Action Atoms:**
```tsx
export const addToCartAtom = atom(
  null,
  (get, set, item: CartItem) => {
    const items = get(cartItemsAtom);
    set(cartItemsAtom, [...items, item]);
  }
);
```

### File Organization
```
src/atoms/
├── authAtoms.ts          # User, session
├── memberAtoms.ts        # Members, roles
├── menuCreatorAtoms.ts   # Menu state
├── permissionAtoms.ts    # Permission checks
├── themeAtoms.ts         # Dark/light theme
├── websocketAtoms.ts     # Connection state
└── workspaceAtoms.ts     # Current workspace
```

---

## STYLING (MANDATORY)

### Theme Management

**NEVER use `dark:` prefix. ALWAYS use `themeAtom`.**

❌ **WRONG:**
```tsx
<div className="bg-white dark:bg-black" />
```

✅ **CORRECT:**
```tsx
const theme = useAtomValue(themeAtom);

<div className={theme === 'dark' ? 'bg-black' : 'bg-white'} />
```

### Apple Aesthetic

**Border Radius:**
- Cards/Modals: `rounded-[2.2rem]`
- Buttons/Inputs: `rounded-[1rem]`

**Glass Effect:**
```tsx
const glassClasses = `
  backdrop-blur-[20px] saturate-[180%]
  ${theme === 'dark' ? 'bg-black/50' : 'bg-white/72'}
  border ${theme === 'dark' ? 'border-white/10' : 'border-white/[0.18]'}
  rounded-[2.2rem]
`;
```

**Touch Targets:**
- Minimum: `44x44px` for all interactive elements
- Buttons: `h-[44px]`

**Typography:**
- Use Apple system font stack
- Minimum: `14px` for body text
- Line height: `1.5` minimum

---

## PERFORMANCE (MANDATORY)

### React.memo
Wrap ALL UI components:
```tsx
export const MenuCard = memo(function MenuCard({ menu }: MenuCardProps) {
  return <Card>...</Card>;
});
```

### useMemo
Use for:
- Expensive computations
- Object/array props passed to memoized children
- Filtered/transformed data

```tsx
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.price - b.price);
}, [items]);
```

### useCallback
Use for:
- Handlers passed to child components
- Functions in dependency arrays

```tsx
const handleClick = useCallback((id: string) => {
  updateItem(id);
}, [updateItem]);
```

---

## STRUCTURE

```
src/
├── pages/
│   └── [PageName]/
│       ├── PageName.tsx         # Layer 1
│       ├── types.ts             # All types
│       ├── hooks/
│       │   ├── usePageData.ts
│       │   └── usePageActions.ts
│       └── components/
│           └── [FunctionalName]/
│               ├── FunctionalName.tsx    # Layer 2
│               └── ui/                   # Layer 3
├── components/
│   └── ui/                      # Global reusable UI (21 components)
├── atoms/                       # Jotai state (8 files)
├── hooks/                       # Global hooks (7 files)
├── guards/                      # Route guards (4 files)
├── layouts/                     # App layout components
├── websocket/                   # WebSocket client
├── services/                    # API clients
├── types/                       # Global types
└── utils/                       # Utilities
```

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add page | `src/pages/[Name]/[Name].tsx` |
| Add hook | `src/pages/[Name]/hooks/use*.ts` |
| Add UI component | `src/components/ui/[Name]/[Name].tsx` |
| Add atom | `src/atoms/[domain]Atoms.ts` |
| Add route | `src/App.tsx` |
| Add guard | `src/guards/` |
| WebSocket | `src/websocket/client.ts` |
| Permissions | `src/utils/permissions.ts` |
| Theme | `src/atoms/themeAtoms.ts` |

---

## ANTI-PATTERNS

- ❌ NEVER use `dark:` prefix → Use `themeAtom` conditionals
- ❌ NEVER use `useState` in Page components → Use custom hooks
- ❌ NEVER use hooks in UI components → Props only
- ❌ NEVER create monolithic atoms → Granular (one value = one atom)
- ❌ NEVER skip React.memo() on UI components → Always wrap
- ❌ NEVER skip useMemo for object/array props → Memoize
- ❌ NEVER use inline handlers in Page → useCallback in hooks
- ❌ NEVER bypass guards for protected routes → Always enforce

---

## CONVENTIONS

### File Naming
- Components: PascalCase (`Dashboard.tsx`)
- Hooks: camelCase + use prefix (`useDashboardData.ts`)
- Types: `types.ts`
- Atoms: camelCase + Atoms suffix (`authAtoms.ts`)

### Import Order
```tsx
// 1. React
import { useEffect } from 'react';

// 2. Types
import type { PageProps } from './types';

// 3. Atoms
import { useAtom } from 'jotai';
import { dataAtom } from '@/atoms/dataAtoms';

// 4. Hooks
import { usePageData } from './hooks/usePageData';

// 5. Components
import { FeatureSection } from './components/FeatureSection/FeatureSection';
import { Card, Button } from '@/components/ui';
```

---

## EXAMPLES

See complete three-layer implementations:
- `src/pages/MenuCreator/` — Multi-step wizard
- `src/pages/Members/` — Tab-based UI
- `src/pages/Dashboard/` — Stats dashboard

---

## NOTES

- Theme persisted via `atomWithStorage` in themeAtoms.ts
- Auth token stored in localStorage (NOT atoms)
- WebSocket auto-reconnects with exponential backoff
- Permission checks use derived atoms for reactivity
