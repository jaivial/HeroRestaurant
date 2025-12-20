import { useAtomValue } from 'jotai';
import { canManageRolesAtom } from '@/atoms/permissionAtoms';
import { Card, Text, Skeleton } from '@/components/ui';
import { RoleRow } from './ui/RoleRow';
import type { RolesListProps } from '../../types';
import type { Role } from '@/atoms/memberAtoms';

interface ExtendedRolesListProps extends RolesListProps {
  onEdit: (role: Role) => void;
}

export function RolesList({ roles, isLoading, currentUserPriority, onEdit }: ExtendedRolesListProps) {
  const canManageRoles = useAtomValue(canManageRolesAtom);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[2.2rem]" />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <Card className="p-12 text-center rounded-[2.2rem] border-dashed border-2">
        <Text color="tertiary">No roles defined for this workspace.</Text>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <RoleRow 
          key={role.id} 
          role={role} 
          canEdit={canManageRoles && role.display_order < currentUserPriority && !role.is_system_role}
          onEdit={onEdit} 
          onDelete={() => {}}
        />
      ))}
    </div>
  );
}

