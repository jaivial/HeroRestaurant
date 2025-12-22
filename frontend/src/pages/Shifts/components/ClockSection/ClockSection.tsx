import { useEffect, useState } from 'react';
import { useClock } from '../../hooks/useClock';
import { Button, Card, Text, Heading } from '@/components/ui';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { cn } from '@/utils/cn';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { formatDuration, formatTime } from '@/utils/time';

interface ClockSectionProps {
  restaurantId: string;
}

export function ClockSection({ restaurantId }: ClockSectionProps) {
  const { status, isLoading, punchIn, punchOut } = useClock(restaurantId);
  const theme = useAtomValue(themeAtom);
  const timeFormat = useAtomValue(timeFormatAtom);
  const use24h = timeFormat === '24h';
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const { isPunchedIn, activeShift } = status;

  useEffect(() => {
    if (!isPunchedIn || !activeShift?.punch_in_at) {
      const timeout = setTimeout(() => setElapsedTime('00:00:00'), 0);
      return () => clearTimeout(timeout);
    }

    const updateTimer = () => {
      setElapsedTime(formatDuration(activeShift.punch_in_at));
    };

    // Use a small delay for the initial update if we are already punched in
    // to avoid the synchronous setState warning
    const timeout = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000); // Update every second for accuracy

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isPunchedIn, activeShift?.punch_in_at]);

  if (isLoading) {
    return (
      <Card className={cn(
        "p-12 flex items-center justify-center min-h-[400px]",
        theme === 'dark' ? "bg-white/5" : "bg-white"
      )}>
        <div className={cn(
          "animate-pulse",
          theme === 'dark' ? "text-white/50" : "text-black/50"
        )}>Loading clock status...</div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-12 flex flex-col items-center justify-center min-h-[400px] text-center",
      theme === 'dark' ? "bg-white/5" : "bg-white"
    )}>
      <div className={cn(
        "w-32 h-32 rounded-full mb-8 flex items-center justify-center transition-colors",
        isPunchedIn 
          ? (theme === 'dark' ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-[#34C759]/15 text-[#34C759]')
          : (theme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-black/5 text-black/30')
      )}>
        <Clock size={48} strokeWidth={1.5} />
      </div>

      <Heading level={2} className={cn(
        "mb-2",
        theme === 'dark' ? "text-white" : "text-black"
      )}>
        {isPunchedIn ? 'You are Punched In' : 'Ready to Start?'}
      </Heading>

      <div className="flex flex-col items-center gap-1 mb-12">
        <Text className={cn(
          "max-w-sm",
          theme === 'dark' ? "text-white/60" : "text-black/60"
        )}>
          {isPunchedIn && activeShift?.punch_in_at
            ? `Working since ${formatTime(activeShift.punch_in_at, use24h)}`
            : 'Clock in to start tracking your working hours for today.'
          }
        </Text>
        {isPunchedIn && (
          <Text className={cn(
            "text-3xl font-bold tracking-tight",
            theme === 'dark' ? "text-white" : "text-black"
          )}>
            {elapsedTime}
          </Text>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {!isPunchedIn ? (
          <Button 
            size="lg" 
            className="h-11 text-[16px] rounded-[1rem] flex items-center justify-center gap-3" 
            onClick={punchIn}
          >
            <LogIn size={20} />
            Punch In
          </Button>
        ) : (
          <Button 
            variant="error" 
            size="lg" 
            className="h-11 text-[16px] rounded-[1rem] flex items-center justify-center gap-3" 
            onClick={() => punchOut()}
          >
            <LogOut size={20} />
            Punch Out
          </Button>
        )}
      </div>
    </Card>
  );
}

