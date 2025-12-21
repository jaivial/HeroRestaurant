import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { activeShiftAtom, isPunchedInAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import { Clock } from 'lucide-react';
import { formatDuration } from '@/utils/time';

export function ActiveShiftClock() {
  const isPunchedIn = useAtomValue(isPunchedInAtom);
  const activeShift = useAtomValue(activeShiftAtom);
  const theme = useAtomValue(themeAtom);
  const [elapsedTime, setElapsedTime] = useState<string>('');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isPunchedIn || !activeShift?.punch_in_at) {
      const timeout = setTimeout(() => setElapsedTime(''), 0);
      return () => clearTimeout(timeout);
    }

    const updateTimer = () => {
      setElapsedTime(formatDuration(activeShift.punch_in_at, false));
    };

    // Use a small delay for the initial update if we are already punched in
    // to avoid the synchronous setState warning
    const timeout = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isPunchedIn, activeShift?.punch_in_at]);

  if (!isPunchedIn) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
      isDark 
        ? "bg-[#30D158]/10 border-[#30D158]/30 text-[#30D158]" 
        : "bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]"
    )}>
      <Clock size={14} className="animate-pulse" />
      <span className="text-xs font-medium tabular-nums">
        {elapsedTime}
      </span>
    </div>
  );
}

