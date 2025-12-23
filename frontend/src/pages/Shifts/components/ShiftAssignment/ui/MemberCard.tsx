import { memo, useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Badge } from '@/components/ui';
import type { MemberShiftSummary } from '../../../types';
import { cn } from '@/utils/cn';
import { User, Clock } from 'lucide-react';

interface MemberCardProps {
  member: MemberShiftSummary;
  isSelected: boolean;
  onClick: () => void;
}

function useTimer(startTime: string) {
  const [duration, setDuration] = useState('');
  
  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  return duration;
}

function RealTimeTracker({ punchInAt }: { punchInAt: string }) {
  const duration = useTimer(punchInAt);
  return (
    <div className="flex items-center gap-1.5 text-apple-blue font-medium animate-pulse">
      <Clock size={12} />
      <span>{duration}</span>
    </div>
  );
}

export const MemberCard = memo(function MemberCard({ member, isSelected, onClick }: MemberCardProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const isPunchedIn = !!member.active_punch_in_at;

  return (
    <div 
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

          {isPunchedIn && member.active_punch_in_at && (
            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
              <RealTimeTracker punchInAt={member.active_punch_in_at} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});