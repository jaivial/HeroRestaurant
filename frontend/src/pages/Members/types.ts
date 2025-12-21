import type { Member, Role } from '@/atoms/memberAtoms';

export type MembersPageProps = Record<string, never>;

export type MembersTab = 'members' | 'roles';

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

