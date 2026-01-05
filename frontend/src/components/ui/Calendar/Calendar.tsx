import { memo, useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  bookingsByDate?: Record<string, number>;
  className?: string;
}

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  
  // Add padding for days before the first of the month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - (firstDay.getDay() - i));
    days.push(prevDate);
  }
  
  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add padding for days after the last of the month
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(lastDay);
    nextDate.setDate(nextDate.getDate() + i);
    days.push(nextDate);
  }
  
  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const Calendar = memo(function Calendar({
  selectedDate,
  onDateSelect,
  bookingsByDate = {},
  className = '',
}: CalendarProps) {
  const theme = useAtomValue(themeAtom);
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  const days = useMemo(() => getDaysInMonth(selectedDate), [selectedDate]);
  const today = new Date();
  const todayKey = formatDateKey(today);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = useCallback((date: Date) => {
    onDateSelect(date);
  }, [onDateSelect]);

  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }, [currentMonth, currentYear]);

  const isToday = useCallback((date: Date) => {
    return formatDateKey(date) === todayKey;
  }, [todayKey]);

  const isSelected = useCallback((date: Date) => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  }, [selectedDate]);

  return (
    <div className={`bg-white/72 dark:bg-black/50 backdrop-blur-[20px] rounded-[2.2rem] border border-white/[0.18] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const bookingCount = bookingsByDate[dateKey] ?? 0;
          const hasBookings = bookingCount > 0;
          const isCurrent = isCurrentMonth(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative aspect-square p-1 rounded-xl
                transition-all duration-200
                flex flex-col items-center justify-center
                ${!isCurrent ? 'opacity-30' : ''}
                ${selected 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : today
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <span className="text-sm">
                {date.getDate()}
              </span>
              {hasBookings && (
                <span className={`
                  absolute bottom-1 w-1.5 h-1.5 rounded-full
                  ${selected ? 'bg-white' : 'bg-blue-500'}
                `} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
