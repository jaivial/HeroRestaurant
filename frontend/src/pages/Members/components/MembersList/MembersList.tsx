import { useAtomValue } from 'jotai';
import { canManageMembersAtom, canRemoveMembersAtom } from '@/atoms/permissionAtoms';
import { Card, Text, Skeleton } from '@/components/ui';
import { MemberCard } from './ui/MemberCard';
import type { MembersListProps } from '../../types';
import type { Member } from '@/atoms/memberAtoms';

interface ExtendedMembersListProps extends MembersListProps {
  onEdit: (member: Member) => void;
  onView: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export function MembersList(props: ExtendedMembersListProps) {
  const { members, isLoading, currentUserPriority, onEdit, onView, onRemove } = props;
  const canManageMembers = useAtomValue(canManageMembersAtom);
  const canRemoveMembers = useAtomValue(canRemoveMembersAtom);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[440px] w-full rounded-[2.2rem]" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member) => (
        <MemberCard 
          key={member.id} 
          member={member} 
          canEdit={canManageMembers && (member.rolePriority || 0) < currentUserPriority}
          canRemove={canRemoveMembers && (member.rolePriority || 0) < currentUserPriority}
          onEdit={onEdit} 
          onRemove={onRemove}
          onView={onView}
        />
      ))}
    </div>
  );
}

