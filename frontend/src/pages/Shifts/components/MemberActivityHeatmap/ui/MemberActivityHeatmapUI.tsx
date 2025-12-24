// frontend/src/pages/Shifts/components/MemberActivityHeatmap/ui/MemberActivityHeatmapUI.tsx

import { memo } from 'react';
import { Text, Card } from '@/components/ui';
import type { MemberActivityHeatmapUIProps } from '../../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const MemberActivityHeatmapUI = memo(function MemberActivityHeatmapUI({
  heatmapData,
  maxIntensity,
  isDark
}: MemberActivityHeatmapUIProps) {
  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return isDark ? 'bg-white/5' : 'bg-black/5';
    
    const ratio = intensity / (maxIntensity || 1);
    
    if (ratio < 0.25) return 'bg-apple-blue/20';
    if (ratio < 0.5) return 'bg-apple-blue/40';
    if (ratio < 0.75) return 'bg-apple-blue/70';
    return 'bg-apple-blue';
  };

  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Text variant="title2" weight="bold">Shift Activity</Text>
          <div className="flex items-center gap-2">
            <Text variant="caption">Less</Text>
            <div className="flex gap-1">
              <div className={`w-3 h-3 rounded-[2px] ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
              <div className="w-3 h-3 rounded-[2px] bg-apple-blue/20" />
              <div className="w-3 h-3 rounded-[2px] bg-apple-blue/40" />
              <div className="w-3 h-3 rounded-[2px] bg-apple-blue/70" />
              <div className="w-3 h-3 rounded-[2px] bg-apple-blue" />
            </div>
            <Text variant="caption">More</Text>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[600px]">
            {/* Hours Header */}
            <div className="grid grid-cols-[50px_repeat(24,1fr)] gap-1 mb-2">
              <div />
              {HOURS.map(hour => (
                <div key={hour} className="text-center">
                  <Text variant="caption" className="text-[10px] opacity-40">
                    {hour === 0 || hour === 12 || hour === 23 ? `${hour}h` : ''}
                  </Text>
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex flex-col gap-1">
              {DAYS.map((dayLabel, dayIndex) => (
                <div key={dayLabel} className="grid grid-cols-[50px_repeat(24,1fr)] gap-1">
                  <div className="flex items-center">
                    <Text variant="caption" className="font-medium opacity-50">{dayLabel}</Text>
                  </div>
                  {HOURS.map(hour => {
                    const data = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                    const intensity = data?.intensity || 0;
                    
                    return (
                      <div 
                        key={`${dayIndex}-${hour}`}
                        className={`aspect-square rounded-[3px] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:z-10 cursor-help ${getIntensityColor(intensity)}`}
                        title={`${dayLabel} at ${hour}:00 - ${intensity} shifts`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-[1rem] bg-apple-blue/5 border border-apple-blue/10">
          <Text variant="caption" className="text-center italic opacity-70">
            This heatmap shows the frequency of shifts started at specific hours throughout the week. 
            Darker blue indicates more frequent activity during those times.
          </Text>
        </div>
      </div>
    </Card>
  );
});
