import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, IconButton, Button } from '@/components/ui';
import type { ShiftHistoryItem } from '../../../types';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { safeParseDate } from '@/utils/time';

interface MonthlyCalendarProps {
  history: ShiftHistoryItem[];
}

export function MonthlyCalendar({ history }: MonthlyCalendarProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const [viewDate, setViewDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Days in month
    const daysInMonth = lastDay.getDate();
    // Starting weekday (0-6, Sun-Sat). Let's use Mon-Sun (0-6)
    const startDay = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6

    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push({ type: 'padding', day: null });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      const dateStr = currentDate.toDateString();
      const dayShifts = history.filter(s => safeParseDate(s.punchInAt).toDateString() === dateStr);
      const totalMinutes = dayShifts.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
      
      days.push({
        type: 'day',
        day: d,
        shifts: dayShifts,
        totalMinutes,
        isToday: dateStr === new Date().toDateString()
      });
    }

    return days;
  }, [history, viewDate]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(viewDate);
    nextDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(nextDate);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const yearName = viewDate.getFullYear();

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
              onClick={goToToday}
              className="rounded-full font-bold text-[13px] mr-2"
            >
              Today
            </Button>
            <div className="flex gap-2">
              <IconButton 
                icon={<ChevronLeft size={20} />} 
                variant="gray"
                onClick={() => changeMonth(-1)}
                className="rounded-full"
              />
              <IconButton 
                icon={<ChevronRight size={20} />} 
                variant="gray"
                onClick={() => changeMonth(1)}
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
// ... (rest of shifts) ...
                  <div className="space-y-1">
                    {item.shifts && item.shifts.slice(0, 2).map(s => (
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
}
