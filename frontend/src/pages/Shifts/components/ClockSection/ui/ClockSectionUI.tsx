// frontend/src/pages/Shifts/components/ClockSection/ui/ClockSectionUI.tsx

import { memo } from 'react';
import { Button, Card, Text, Heading } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { formatTime } from '@/utils/time';

interface ClockSectionUIProps {
  theme: string;
  isPunchedIn: boolean;
  activeShift: any;
  isLoading: boolean;
  elapsedTime: string;
  use24h: boolean;
  onPunchIn: () => void;
  onPunchOut: (notes?: string) => void;
}

export const ClockSectionUI = memo(function ClockSectionUI({
  theme,
  isPunchedIn,
  activeShift,
  isLoading,
  elapsedTime,
  use24h,
  onPunchIn,
  onPunchOut
}: ClockSectionUIProps) {
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
            onClick={onPunchIn}
          >
            <LogIn size={20} />
            Punch In
          </Button>
        ) : (
          <Button 
            variant="error" 
            size="lg" 
            className="h-11 text-[16px] rounded-[1rem] flex items-center justify-center gap-3" 
            onClick={() => onPunchOut()}
          >
            <LogOut size={20} />
            Punch Out
          </Button>
        )}
      </div>
    </Card>
  );
});
