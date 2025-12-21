import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card, Badge, Text, IconButton } from '@/components/ui';
import type { RoleRowProps } from '../../../types';

export const RoleCard = memo(function RoleCard({ role, canEdit, onEdit, onDelete }: RoleRowProps) {
  const theme = useAtomValue(themeAtom);

  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border border-white/[0.18]';

  return (
    <Card 
      className={`p-6 rounded-[2.2rem] transition-all duration-500 flex flex-col justify-between h-full ${glassClasses} shadow-apple-sm hover:shadow-apple-float group relative overflow-hidden`}
    >
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-apple-purple/5 rounded-full blur-2xl group-hover:bg-apple-purple/10 transition-colors duration-500" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <Badge 
            className="font-bold px-4 py-1.5 rounded-full"
            style={{ 
              backgroundColor: role.color ? `${role.color}20` : undefined,
              color: role.color || undefined,
              borderColor: role.color ? `${role.color}40` : undefined
            }}
          >
            {role.name}
          </Badge>
          
          {role.is_system_role && (
            <Badge variant="info" size="sm" className="opacity-70 rounded-full font-medium">System Role</Badge>
          )}
        </div>
        
        <Text variant="body" className="line-clamp-3 mb-6 text-content-secondary leading-relaxed">
          {role.description || 'No description provided for this role.'}
        </Text>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-tertiary/30">
        <div className="flex flex-col">
          <Text variant="caption1" color="tertiary" className="uppercase tracking-widest font-bold">Priority</Text>
          <Text variant="headline" weight="bold" className="text-apple-blue">{role.display_order}</Text>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-2">
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              onClick={() => onEdit(role)}
              variant="ghost"
              size="md"
              aria-label="Edit role"
              className="rounded-full bg-apple-blue/5 text-apple-blue hover:bg-apple-blue/20 transition-all"
            />
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={() => onDelete(role)}
              variant="ghost"
              size="md"
              aria-label="Delete role"
              className="rounded-full bg-apple-red/5 text-apple-red hover:bg-apple-red/20 transition-all"
            />
          </div>
        )}
      </div>
    </Card>
  );
});

