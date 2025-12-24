// frontend/src/pages/Shifts/components/MonthlyCalendar/ui/MonthlyCalendarUI.tsx

import { memo } from 'react';
import { Text, IconButton, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthlyCalendarUIProps } from '../../../types';

export const MonthlyCalendarUI = memo(function MonthlyCalendarUI({
  isDark,
  calendarData,
  monthName,
  yearName,
  weekdays,
  onChangeMonth,
  onGoToToday
}: MonthlyCalendarUIProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col">
          <Text weight="bold" className={cn(
            "text-[20px] md:text-[24px]",
            isDark ? "text-white" : "text-black"
          )}>
            {monthName}
          </Text>
          <Text variant="caption1" className={isDark ? "text-white/40" : "text-black/40"}>{yearName}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="glass" 
            size="sm" 
            onClick={onGoToToday}
            className="rounded-full font-bold text-[13px] mr-2"
          >
            Today
          </Button>
          <div className="flex gap-2">
            <IconButton 
              icon={<ChevronLeft size={20} />} 
              variant="gray"
              onClick={() => onChangeMonth(-1)}
              className="rounded-full"
            />
            <IconButton 
              icon={<ChevronRight size={20} />} 
              variant="gray"
              onClick={() => onChangeMonth(1)}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekdays.map(wd => (
            <div key={wd} className="py-2 text-center">
              <Text variant="caption" weight="bold" className={cn(
                "uppercase tracking-widest text-[10px] md:text-[12px]",
                isDark ? "text-white/40" : "text-black/40"
              )}>{wd}</Text>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((item, idx) => (
            <div 
              key={idx}
              className={cn(
                "min-h-[60px] md:min-h-[100px] p-2 rounded-[1rem] transition-all duration-300",
                item.type === 'padding' ? "opacity-0 pointer-events-none" : "border",
                isDark 
                  ? "bg-white/5 border-white/5" 
                  : "bg-white/60 border-black/[0.03]",
                item.type === 'day' && item.totalMinutes && item.totalMinutes > 0 && (isDark ? "bg-apple-blue/10 border-apple-blue/20" : "bg-apple-blue/5 border-apple-blue/10"),
                item.type === 'day' && item.isToday && (isDark ? "border-apple-blue/50 border-white/20" : "border-apple-blue/40 border-black/[0.08]")
              )}
            >
              {item.type === 'day' && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <Text weight="semibold" className={cn(
                      "text-[12px] md:text-[14px]",
                      item.isToday ? "text-apple-blue font-bold" : (item.totalMinutes && item.totalMinutes > 0 ? "text-apple-blue" : (isDark ? "text-white/40" : "text-black/40"))
                    )}>
                      {item.day}
                    </Text>
                    {item.totalMinutes && item.totalMinutes > 0 && (
                      <Text weight="bold" className="text-apple-blue text-[10px] md:text-[12px]">
                        {(item.totalMinutes / 60).toFixed(1)}h
                      </Text>
                    )}
                  </div>
                  <div className="space-y-1">
                    {item.shifts && item.shifts.slice(0, 2).map((s: any) => (
                      <div 
                        key={s.id} 
                        className={cn(
                          "h-1 md:h-1.5 rounded-full w-full",
                          isDark ? "bg-apple-blue/40" : "bg-apple-blue/30"
                        )} 
                        title={`${((s.totalMinutes || 0)/60).toFixed(1)}h shift`}
                      />
                    ))}
                    {item.shifts && item.shifts.length > 2 && (
                      <div className={cn(
                        "text-[8px] md:text-[10px] text-center",
                        isDark ? "text-white/30" : "text-black/30"
                      )}>+{item.shifts.length - 2}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
