import type { Member, Role } from '@/atoms/memberAtoms';

export interface MembersPageProps {
  // Add props if needed
}

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
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export interface RoleRowProps {
  role: Role;
  canEdit: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

