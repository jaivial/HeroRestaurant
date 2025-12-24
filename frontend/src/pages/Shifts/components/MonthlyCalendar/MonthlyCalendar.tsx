// frontend/src/pages/Shifts/components/MonthlyCalendar/MonthlyCalendar.tsx

import { useMonthlyCalendar } from '../../hooks/useMonthlyCalendar';
import { MonthlyCalendarUI } from './ui/MonthlyCalendarUI';
import type { MonthlyCalendarProps } from '../../types';

export function MonthlyCalendar({ history }: MonthlyCalendarProps) {
  const calendar = useMonthlyCalendar(history);

  return (
    <MonthlyCalendarUI 
      {...calendar}
      history={history}
      onChangeMonth={calendar.changeMonth}
      onGoToToday={calendar.goToToday}
    />
  );
}
