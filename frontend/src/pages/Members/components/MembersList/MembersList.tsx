import { useAtomValue } from 'jotai';
import { canManageMembersAtom } from '@/atoms/permissionAtoms';
import { Card, Text, Skeleton } from '@/components/ui';
import { MemberRow } from './ui/MemberRow';
import type { MembersListProps } from '../../types';
import type { Member } from '@/atoms/memberAtoms';

interface ExtendedMembersListProps extends MembersListProps {
  onEdit: (member: Member) => void;
}

export function MembersList({ members, isLoading, currentUserPriority, onEdit }: ExtendedMembersListProps) {
  const canManageMembers = useAtomValue(canManageMembersAtom);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-[2.2rem]" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="p-12 text-center rounded-[2.2rem] border-dashed border-2">
        <Text color="tertiary">No members found in this workspace.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <MemberRow 
          key={member.id} 
          member={member} 
          canEdit={canManageMembers && (member.rolePriority || 0) < currentUserPriority}
          onEdit={onEdit} 
          onRemove={() => {}}
        />
      ))}
    </div>
  );
}

