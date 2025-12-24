// frontend/src/pages/Shifts/components/MemberCard/ui/MemberCardUI.tsx

import { memo } from 'react';
import { Text, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { User, Clock } from 'lucide-react';
import type { MemberShiftSummary } from '../../../types';

interface MemberCardUIProps {
  member: MemberShiftSummary;
  isSelected: boolean;
  isDark: boolean;
  isPunchedIn: boolean;
  duration?: string;
  onClick: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
}

export const MemberCardUI = memo(function MemberCardUI({ 
  member, 
  isSelected, 
  isDark, 
  isPunchedIn, 
  duration, 
  onClick,
  cardRef
}: MemberCardUIProps) {
  return (
    <div 
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "p-4 rounded-[1.5rem] cursor-pointer transition-all duration-200 border",
        isSelected 
          ? (isDark ? "bg-apple-blue/20 border-apple-blue/40" : "bg-apple-blue/10 border-apple-blue/30")
          : (isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-black/[0.02] border-black/[0.02] hover:bg-black/[0.04]")
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isDark ? "bg-white/10" : "bg-black/5"
        )}>
          <User size={20} className={isDark ? "text-white/60" : "text-black/40"} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <Text weight="bold" className="truncate">{member.name}</Text>
            {isPunchedIn && (
              <Badge variant="success" size="sm" dot className="flex-shrink-0">In</Badge>
            )}
          </div>
          
          <Text variant="footnote" color="tertiary" className="truncate mb-2">{member.email}</Text>
          
          <div className="flex flex-wrap items-center gap-2">
            {member.role_name && (
              <Badge variant="secondary" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                {member.role_name}
              </Badge>
            )}
            {member.membership_status && member.membership_status !== 'active' && (
              <Badge variant="error" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                {member.membership_status}
              </Badge>
            )}
          </div>

          {isPunchedIn && duration && (
            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1.5 text-apple-blue font-medium animate-pulse">
                <Clock size={12} />
                <span>{duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
