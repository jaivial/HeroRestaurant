import { atom } from 'jotai';

export interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  roleId: string | null;
  accessFlags: string;
  displayName: string | null;
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  lastActiveAt: string | null;
  roleName?: string | null;
  rolePriority?: number;
  roleColor?: string | null;
}

export interface Role {
  id: string;
  restaurant_id: string | null;
  name: string;
  description: string | null;
  permissions: string;
  is_system_role: boolean;
  display_order: number;
  color: string | null;
}

// ─── Base Atoms ─────────────────────────────────────────────
export const membersAtom = atom<Member[]>([]);
export const rolesAtom = atom<Role[]>([]);
export const membersLoadingAtom = atom<boolean>(false);
export const rolesLoadingAtom = atom<boolean>(false);

// ─── Derived Atoms ──────────────────────────────────────────
export const sortedRolesAtom = atom((get) => {
  const roles = get(rolesAtom);
  return [...roles].sort((a, b) => b.display_order - a.display_order);
});

export const membersByPriorityAtom = atom((get) => {
  const members = get(membersAtom);
  return [...members].sort((a, b) => (b.rolePriority ?? 0) - (a.rolePriority ?? 0));
});

