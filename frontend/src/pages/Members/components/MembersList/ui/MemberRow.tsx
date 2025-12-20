import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card, Avatar, Badge, Text, IconButton } from '@/components/ui';
import type { MemberRowProps } from '../../../types';

export const MemberRow = memo(function MemberRow({ member, canEdit, onEdit, onRemove }: MemberRowProps) {
  const theme = useAtomValue(themeAtom);

  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border border-white/[0.18]';

  return (
    <Card 
      className={`p-4 flex items-center justify-between rounded-[2.2rem] transition-all duration-300 ${glassClasses} shadow-apple-sm hover:shadow-apple-md`}
    >
      <div className="flex items-center gap-4">
        <Avatar 
          src={member.user.avatarUrl || undefined} 
          name={member.user.name} 
          size="md"
          className="ring-2 ring-surface-tertiary"
        />
        <div>
          <div className="flex items-center gap-2">
            <Text weight="bold" className="text-content-primary">{member.user.name}</Text>
            {member.status !== 'active' && (
              <Badge variant={member.status === 'pending' ? 'warning' : 'error'} size="sm">
                {member.status}
              </Badge>
            )}
          </div>
          <Text variant="subheadline" color="tertiary">Member ID: {member.id.slice(0, 8)}</Text>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <Badge 
            className="font-medium"
            style={{ 
              backgroundColor: member.roleColor ? `${member.roleColor}20` : undefined,
              color: member.roleColor || undefined,
              borderColor: member.roleColor ? `${member.roleColor}40` : undefined
            }}
          >
            {member.roleName || 'No Role'}
          </Badge>
          <div className="mt-1">
            <Text variant="caption1" color="tertiary">Priority: {member.rolePriority ?? 0}</Text>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1">
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              onClick={() => onEdit(member)}
              variant="ghost"
              size="sm"
              aria-label="Edit member"
              className="text-content-tertiary hover:text-apple-blue hover:bg-apple-blue/10"
            />
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={() => onRemove(member)}
              variant="ghost"
              size="sm"
              aria-label="Remove member"
              className="text-content-tertiary hover:text-apple-red hover:bg-apple-red/10"
            />
          </div>
        )}
      </div>
    </Card>
  );
});

