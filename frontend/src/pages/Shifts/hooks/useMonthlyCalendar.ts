// frontend/src/pages/Shifts/hooks/useMonthlyCalendar.ts

import { useMemo, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { safeParseDate } from '@/utils/time';
import type { ShiftHistoryItem } from '../types';

export function useMonthlyCalendar(history: ShiftHistoryItem[]) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const [viewDate, setViewDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7;

    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push({ type: 'padding', day: null });
    }

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

  const changeMonth = useCallback((offset: number) => {
    setViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setViewDate(new Date());
  }, []);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const yearName = viewDate.getFullYear();

  return {
    isDark,
    viewDate,
    calendarData,
    changeMonth,
    goToToday,
    monthName,
    yearName,
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
}
