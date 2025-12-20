import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card, Badge, Text, IconButton } from '@/components/ui';
import type { RoleRowProps } from '../../../types';

export const RoleRow = memo(function RoleRow({ role, canEdit, onEdit, onDelete }: RoleRowProps) {
  const theme = useAtomValue(themeAtom);

  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border border-white/[0.18]';

  return (
    <Card 
      className={`p-5 rounded-[2.2rem] transition-all duration-300 flex flex-col justify-between h-full ${glassClasses} shadow-apple-sm hover:shadow-apple-md`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <Badge 
            className="font-bold px-3 py-1"
            style={{ 
              backgroundColor: role.color ? `${role.color}20` : undefined,
              color: role.color || undefined,
              borderColor: role.color ? `${role.color}40` : undefined
            }}
          >
            {role.name}
          </Badge>
          
          {role.is_system_role && (
            <Badge variant="info" size="sm" className="opacity-70">System</Badge>
          )}
        </div>
        
        <Text variant="subheadline" className="line-clamp-2 mb-4 h-10">
          {role.description || 'No description provided.'}
        </Text>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-tertiary/50">
        <Text variant="caption1" color="tertiary" weight="medium">Priority: {role.display_order}</Text>
        
        {canEdit && (
          <div className="flex items-center gap-1">
            <IconButton 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              onClick={() => onEdit(role)}
              variant="ghost"
              size="sm"
              aria-label="Edit role"
              className="text-content-tertiary hover:text-apple-blue hover:bg-apple-blue/10"
            />
            <IconButton 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={() => onDelete(role)}
              variant="ghost"
              size="sm"
              aria-label="Delete role"
              className="text-content-tertiary hover:text-apple-red hover:bg-apple-red/10"
            />
          </div>
        )}
      </div>
    </Card>
  );
});

