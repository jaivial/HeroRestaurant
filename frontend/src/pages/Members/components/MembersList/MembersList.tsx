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
      <Card className="p-16 text-center rounded-[2.2rem] border-dashed border-2 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-apple-gray-100 dark:bg-apple-gray-900 flex items-center justify-center text-apple-gray-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <Text variant="headline" weight="bold">No members found</Text>
          <Text color="tertiary">Try adjusting your filters or invite new members to this workspace.</Text>
        </div>
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

