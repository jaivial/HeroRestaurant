import type { Member, Role } from '@/atoms/memberAtoms';

export type MembersPageProps = Record<string, never>;

export type MembersTab = 'members' | 'roles';

export type ShiftPeriod = 'daily' | 'weekly' | 'monthly' | 'trimestral' | 'semmestral' | 'anual';

export interface MembersListProps {
  members: Member[];
  isLoading: boolean;
  currentUserPriority: number;
}

export interface RolesListProps {
  roles: Role[];
  isLoading: boolean;
  currentUserPriority: number;
}

export interface MemberRowProps {
  member: Member;
  canEdit: boolean;
  canRemove: boolean;
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
  onView: (member: Member) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface RoleRowProps {
  role: Role;
  canEdit: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Shift Types ──────────────────────────────────────────
export interface ShiftHistoryItem {
  id: string;
  punchInAt: string;
  punchOutAt: string | null;
  totalMinutes: number | null;
  notes: string | null;
}

export interface MemberShiftStats {
  workedMinutes: number;
  contractedMinutes: number;
  differenceMinutes: number;
  status: 'healthy' | 'caution' | 'overworked' | 'critical';
  history: ShiftHistoryItem[];
}

export interface MemberShiftStatus {
  isPunchedIn: boolean;
  activeShift: ShiftHistoryItem | null;
  presence?: {
    isConnected: boolean;
    connectedAt: string | null;
  };
}

