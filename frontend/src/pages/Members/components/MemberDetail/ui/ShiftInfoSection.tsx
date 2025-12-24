import { useEffect, useState } from 'react';
import { Text } from '@/components/ui';
import { Clock } from 'lucide-react';
import { formatDuration, formatTime } from '@/utils/time';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { cn } from '@/utils/cn';
import type { MemberShiftStatus } from '../../../types';

interface ShiftInfoSectionProps {
  status: MemberShiftStatus;
  isDark: boolean;
}

export function ShiftInfoSection({ status, isDark }: ShiftInfoSectionProps) {
  const timeFormat = useAtomValue(timeFormatAtom);
  const use24h = timeFormat === '24h';
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const { isPunchedIn, activeShift } = status;

  useEffect(() => {
    if (!isPunchedIn || !activeShift?.punchInAt) {
      // If we are not punched in, we reset the timer. 
      // To avoid synchronous setState in effect body, we use setTimeout
      const timer = setTimeout(() => {
        setElapsedTime(prev => prev === '00:00:00' ? prev : '00:00:00');
      }, 0);
      return () => clearTimeout(timer);
    }

    const updateTimer = () => {
      setElapsedTime(formatDuration(activeShift.punchInAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isPunchedIn, activeShift?.punchInAt]);

  // Glass Effect styles (matching MemberDetailModal)
  const glassBase = "backdrop-blur-[20px] saturate-[180%]";
  const surfaceCard = cn(
    'rounded-[1.2rem] border transition-all duration-200',
    glassBase,
    isDark 
      ? 'bg-[#1C1C1E]/80 border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4)]' 
      : 'bg-white/70 border-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
  );

  return (
    <section className="space-y-3 h-full flex flex-col">
      <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
        Current Shift Status
      </Text>
      <div className={cn(surfaceCard, 'p-6 flex flex-col md:flex-row items-center justify-between gap-6 flex-1')}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
            isPunchedIn 
              ? (isDark ? 'bg-[#28A745]/20 text-[#28A745]' : 'bg-[#1E7E34]/15 text-[#1E7E34]')
              : (isDark ? 'bg-white/10 text-white/40' : 'bg-black/5 text-black/30')
          )}>
            <Clock size={40} strokeWidth={1.5} />
          </div>

          <div className="space-y-1 text-center md:text-left">
            <Text variant="title2" weight="bold" color="primary">
              {isPunchedIn ? 'Currently Punched In' : 'Punched Out'}
            </Text>
            <Text variant="body" color="tertiary">
              {isPunchedIn && activeShift?.punchInAt
                ? `Working since ${formatTime(activeShift.punchInAt, use24h)}`
                : 'No active shift recorded for today.'
              }
            </Text>
          </div>
        </div>

        {isPunchedIn && (
          <div className={cn(
            "px-8 py-3 rounded-2xl flex flex-col items-center md:items-end",
            isDark ? "bg-white/10" : "bg-black/5"
          )}>
            <Text variant="caption2" weight="bold" color="tertiary" className="uppercase tracking-widest mb-1">Elapsed Time</Text>
            <Text weight="bold" className="text-4xl tracking-tight font-mono">
              {elapsedTime}
            </Text>
          </div>
        )}
      </div>
    </section>
  );
}
