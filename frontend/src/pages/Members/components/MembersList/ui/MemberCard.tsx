import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card, Avatar, Badge, Text, IconButton } from '@/components/ui';
import type { Member } from '@/atoms/memberAtoms';
import { cn } from '@/utils/cn';

interface MemberCardProps {
  member: Member;
  canEdit: boolean;
  canRemove: boolean;
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
  onView: (member: Member) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MemberCard = memo(function MemberCard({ 
  member, 
  canEdit, 
  canRemove, 
  onEdit, 
  onRemove, 
  onView,
  className,
  style
}: MemberCardProps) {
  const theme = useAtomValue(themeAtom);

  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/85 border-black/[0.08] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.04)]';

  const hoverShadow = theme === 'dark'
    ? 'hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_8px_10px_-6px_rgba(0,0,0,0.4)]'
    : 'hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]';

  return (
    <Card 
      className={cn(
        "p-5 sm:p-6 rounded-[2.2rem] transition-all duration-500 flex flex-col items-center text-center relative group overflow-hidden border",
        "min-h-min max-h-min justify-between",
        "hover:scale-[1.02] active:scale-[0.98]",
        glassClasses,
        hoverShadow,
        className
      )}
      style={style}
    >
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-apple-blue/10 rounded-full blur-2xl group-hover:bg-apple-blue/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-apple-purple/5 rounded-full blur-2xl group-hover:bg-apple-purple/15 transition-all duration-700" />
      
      <div className="space-y-4 pt-2 relative z-10 w-full flex-1 flex flex-col justify-center">
        <div className="relative inline-block">
          <Avatar 
            src={member.user.avatarUrl || undefined} 
            name={member.user.name} 
            size="xl"
            status={member.status === 'active' ? 'online' : 'offline'}
            className="ring-4 ring-white/10 group-hover:ring-apple-blue/30 transition-all duration-500 shadow-apple-md"
          />
        </div>

        <div className="space-y-1">
          <Text weight="bold" variant="headline" className="text-content-primary line-clamp-1 text-lg">{member.user.name}</Text>
          <div className="flex justify-center pb-4">
            <Badge 
              className={cn(
                "font-semibold px-3 py-1 transition-all duration-300",
                !member.roleName && "bg-transparent border border-dashed border-content-tertiary/50 text-content-tertiary shadow-none"
              )}
              style={member.roleName ? { 
                backgroundColor: member.roleColor ? `${member.roleColor}15` : undefined,
                color: member.roleColor || undefined,
                borderColor: member.roleColor ? `${member.roleColor}30` : undefined,
                borderWidth: member.roleColor ? '1px' : '0',
                boxShadow: member.roleColor ? `0 2px 8px -2px ${member.roleColor}40` : undefined
              } : {}}
            >
              {member.roleName || 'No Role'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 relative z-10">
        <div className={cn(
          "flex justify-around items-center px-2 py-3 rounded-2xl border transition-colors duration-300",
          theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
        )}>
          <div className="flex flex-col items-center">
            <Text variant="caption2" color="tertiary" className="uppercase tracking-[0.15em] mb-0.5 font-bold">Priority</Text>
            <Text variant="body" weight="bold" className="text-apple-blue">{member.rolePriority ?? 0}</Text>
          </div>
          <div className={cn("h-8 w-px", theme === 'dark' ? "bg-white/10" : "bg-black/10")} />
          <div className="flex flex-col items-center">
            <Text variant="caption2" color="tertiary" className="uppercase tracking-[0.15em] mb-0.5 font-bold">Status</Text>
            <Text variant="body" weight="bold" className={cn(member.status === 'active' ? 'text-apple-green' : 'text-apple-red')}>
              {member.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <IconButton 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            onClick={() => onView(member)}
            variant="tinted"
            color="blue"
            size="md"
            label="View member details"
            className="hover:scale-110 active:scale-90 transition-all shadow-sm"
          />
          
          {canEdit && (
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              onClick={() => onEdit(member)}
              variant="tinted"
              color="orange"
              size="md"
              label="Edit member"
              className="hover:scale-110 active:scale-90 transition-all shadow-sm"
            />
          )}

          {canRemove && (
            <IconButton 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={() => onRemove(member)}
              variant="tinted"
              color="red"
              size="md"
              label="Remove member"
              className="hover:scale-110 active:scale-90 transition-all shadow-sm"
            />
          )}
        </div>
      </div>
    </Card>
  );
});

