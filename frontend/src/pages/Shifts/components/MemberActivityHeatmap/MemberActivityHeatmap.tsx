// frontend/src/pages/Shifts/components/MemberActivityHeatmap/MemberActivityHeatmap.tsx

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import type { MemberActivityHeatmapProps, HeatmapData } from '../../types';
import { MemberActivityHeatmapUI } from './ui/MemberActivityHeatmapUI';

export function MemberActivityHeatmap({ history }: MemberActivityHeatmapProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const { heatmapData, maxIntensity } = useMemo(() => {
    const counts: Record<string, number> = {};
    let max = 0;

    // Process history to count occurrences per day/hour
    history.forEach(shift => {
      const punchIn = new Date(shift.punchInAt);
      const day = punchIn.getDay(); // 0-6 (Sun-Sat)
      const hour = punchIn.getHours(); // 0-23

      const key = `${day}-${hour}`;
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > max) max = counts[key];
    });

    const data: HeatmapData[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        data.push({
          day,
          hour,
          intensity: counts[key] || 0
        });
      }
    }

    return { heatmapData: data, maxIntensity: max };
  }, [history]);

  return (
    <MemberActivityHeatmapUI 
      heatmapData={heatmapData}
      maxIntensity={maxIntensity}
      isDark={isDark}
    />
  );
}
