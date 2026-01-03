# JOTAI ATOMS KNOWLEDGE BASE

**⚠️ MANDATORY:** Follow `../../../docs/general-rules/frontend-organization.md` (Atom section)

---

## OVERVIEW

Jotai state management with **granular atoms** organized by domain.

**Total:** 44 atoms (33 base + 11 derived) across 8 files

---

## GRANULARIZATION (REQUIRED)

### Rule: One Value = One Atom

❌ **WRONG — Monolithic:**
```typescript
const userAtom = atom({
  id: '',
  name: '',
  email: '',
  avatar: '',
  preferences: { theme: 'light' },
});

// Updating theme re-renders ALL components using ANY user field
```

✅ **CORRECT — Granular:**
```typescript
const userIdAtom = atom<string>('');
const userNameAtom = atom<string>('');
const userEmailAtom = atom<string>('');
const userAvatarAtom = atom<string>('');
const userThemeAtom = atom<'light' | 'dark'>('light');

// Each component subscribes only to what it needs
// Updating theme only re-renders theme-dependent components
```

---

## ATOM TYPES

### 1. Base Atoms (Primitive State)
```typescript
export const menuItemsAtom = atom<MenuItem[]>([]);
export const isLoadingAtom = atom<boolean>(false);
export const currentUserIdAtom = atom<string | null>(null);
```

### 2. Derived Atoms (Computed)
```typescript
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const isConnectedAtom = atom((get) => {
  const status = get(connectionStatusAtom);
  return status === 'connected' || status === 'authenticated';
});
```

### 3. Action Atoms (Mutations)
```typescript
export const addToCartAtom = atom(
  null, // read = null (write-only)
  (get, set, item: CartItem) => {
    const items = get(cartItemsAtom);
    set(cartItemsAtom, [...items, item]);
  }
);

export const toggleThemeAtom = atom(
  null,
  (get, set) => {
    const current = get(themeAtom);
    set(themeAtom, current === 'light' ? 'dark' : 'light');
  }
);
```

### 4. Persisted Atoms
```typescript
import { atomWithStorage } from 'jotai/utils';

export const themeAtom = atomWithStorage<Theme>('theme', 'light');
// Automatically syncs to localStorage
```

---

## NAMING CONVENTION

### Pattern: `[domain][Entity][Type]Atom`

| Type | Example | Description |
|------|---------|-------------|
| Base | `currentUserIdAtom` | Direct state |
| Derived | `canViewDashboardAtom` | Computed value |
| Derived | `isConnectedAtom` | Boolean check |
| Action | `toggleThemeAtom` | Side effect / mutation |
| Action | `addToCartAtom` | Collection mutation |

### Prefixes
- `can*Atom` — Permission checks (derived)
- `is*Atom` — Boolean state (derived)
- `toggle*Atom` — Toggle action (write-only)
- `add*Atom`, `remove*Atom` — Collection actions

---

## FILE ORGANIZATION

```
atoms/
├── authAtoms.ts          # 8 atoms: user, session, activity
├── layoutAtoms.ts        # 3 atoms: sidebar, mobile viewport
├── memberAtoms.ts        # 4 atoms: members, roles, loading
├── menuCreatorAtoms.ts   # 5 atoms: menus, current menu, onboarding
├── permissionAtoms.ts    # 26 atoms: raw flags + 24 derived checks
├── themeAtoms.ts         # 2 atoms: theme (persisted) + toggle
├── websocketAtoms.ts     # 11 atoms: connection state + 5 derived
└── workspaceAtoms.ts     # 4 atoms: workspace context
```

**Rule:** One file per domain, max ~100 lines per file.

---

## ATOM FILES BREAKDOWN

### authAtoms.ts (8 atoms)
```typescript
authStatusAtom           // 'unknown' | 'authenticated' | 'unauthenticated'
currentUserIdAtom        // string | null
currentUserNameAtom      // string | null
currentUserEmailAtom     // string | null
currentUserAvatarAtom    // string | null
sessionExpiryAtom        // number | null
lastActivityAtom         // number
currentUserGlobalFlagsAtom // bigint
```

### themeAtoms.ts (2 atoms)
```typescript
themeAtom                // 'light' | 'dark' (persisted)
toggleThemeAtom          // Action: toggle theme
```

### websocketAtoms.ts (11 atoms)
**Base:**
```typescript
connectionStatusAtom     // 6 states: disconnected, connecting, connected, etc.
reconnectAttemptAtom     // number
lastConnectedAtAtom      // number | null
lastErrorAtom            // string | null
sessionTokenAtom         // string | null
pendingRequestsAtom      // Map<string, PendingRequest>
```

**Derived:**
```typescript
isConnectedAtom          // boolean
isAuthenticatedWSAtom    // boolean
isReconnectingAtom       // boolean
isConnectionHealthyAtom  // boolean
isConnectionUnhealthyAtom // boolean
```

### permissionAtoms.ts (26 atoms)
**Base:**
```typescript
rawPermissionsAtom       // bigint (all permissions)
currentUserPriorityAtom  // number (role priority)
```

**Derived (24 permission checks):**
```typescript
canViewDashboardAtom
canViewOrdersAtom, canCreateOrdersAtom, canUpdateOrdersAtom, canCancelOrdersAtom
canViewTablesAtom, canManageTablesAtom
canViewMenuAtom, canEditMenuAtom
canViewInventoryAtom, canManageInventoryAtom
canViewReportsAtom, canExportReportsAtom
canViewMembersAtom, canInviteMembersAtom, canManageMembersAtom, canRemoveMembersAtom
canManageRolesAtom
canViewSettingsAtom, canEditSettingsAtom
canViewBillingAtom, canManageBillingAtom
canDeleteRestaurantAtom
```

---

## USAGE PATTERNS

### Read-Only (useAtomValue)
```typescript
import { useAtomValue } from 'jotai';
import { themeAtom, canManageMembersAtom } from '@/atoms';

function MyComponent() {
  const theme = useAtomValue(themeAtom);
  const canManage = useAtomValue(canManageMembersAtom);
  
  return <div className={theme === 'dark' ? '...' : '...'} />;
}
```

### Write-Only (useSetAtom)
```typescript
import { useSetAtom } from 'jotai';
import { toggleThemeAtom, currentUserIdAtom } from '@/atoms';

function Controls() {
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const setUserId = useSetAtom(currentUserIdAtom);
  
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

### Read + Write (useAtom)
```typescript
import { useAtom } from 'jotai';
import { menuItemsAtom } from '@/atoms';

function MenuEditor() {
  const [items, setItems] = useAtom(menuItemsAtom);
  
  const addItem = (item: MenuItem) => {
    setItems([...items, item]);
  };
  
  return <button onClick={() => addItem(newItem)}>Add</button>;
}
```

### Non-React Updates (WebSocket Client)
```typescript
import { getDefaultStore } from 'jotai';
import { connectionStatusAtom } from '@/atoms/websocketAtoms';

const store = getDefaultStore();
store.set(connectionStatusAtom, 'authenticated');
```

---

## PERSISTENCE

### Only themeAtom is Persisted
```typescript
export const themeAtom = atomWithStorage<Theme>('theme', 'light');
```

**Why only theme?**
- Auth token stored in localStorage directly (security)
- Other state is ephemeral (reset on page reload)
- Theme preference persists across sessions

---

## ANTI-PATTERNS

- ❌ NEVER create monolithic atoms → Granular (one value = one atom)
- ❌ NEVER combine unrelated state → Separate atoms by domain
- ❌ NEVER use derived atoms for base state → Use base atoms
- ❌ NEVER skip memoization → Derived atoms prevent recalculation
- ❌ NEVER mutate atom values → Return new objects/arrays

---

## CONVENTIONS

- Atom names end with `Atom`
- One file per domain (auth, theme, cart, etc.)
- Max ~100 lines per file
- Export all atoms (no default exports)
- Group by type: base → derived → action

---

## EXAMPLES

See complete atom implementations:
- `permissionAtoms.ts` — 24 derived permission checks
- `websocketAtoms.ts` — Connection state + 5 derived booleans
- `menuCreatorAtoms.ts` — Menu stats derived from menus array
