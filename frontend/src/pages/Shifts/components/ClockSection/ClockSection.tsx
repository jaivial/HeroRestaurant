// frontend/src/pages/Shifts/components/ClockSection/ClockSection.tsx

import { useEffect, useState } from 'react';
import { useClock } from '../../hooks/useClock';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { formatDuration } from '@/utils/time';
import { ClockSectionUI } from './ui/ClockSectionUI';

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

    const timeout = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isPunchedIn, activeShift?.punch_in_at]);

  return (
    <ClockSectionUI 
      theme={theme}
      isPunchedIn={isPunchedIn}
      activeShift={activeShift}
      isLoading={isLoading}
      elapsedTime={elapsedTime}
      use24h={use24h}
      onPunchIn={punchIn}
      onPunchOut={punchOut}
    />
  );
}
