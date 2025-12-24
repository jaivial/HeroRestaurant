import { Select, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { Table as TableIcon, Calendar, CalendarDays } from 'lucide-react';
import type { ShiftPeriod } from '../../../types';

interface ShiftFiltersProps {
  period: ShiftPeriod;
  onPeriodChange: (period: ShiftPeriod) => void;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  isDark: boolean;
}

export function ShiftFilters({
  period,
  onPeriodChange,
  viewMode,
  onViewModeChange,
  isDark,
}: ShiftFiltersProps) {
  const theme = isDark ? 'dark' : 'light';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="w-full sm:w-48">
        <Select
          value={period}
          onChange={(val) => onPeriodChange(val as ShiftPeriod)}
          theme={theme}
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Trimestral', value: 'trimestral' },
            { label: 'Semmestral', value: 'semmestral' },
            { label: 'Anual', value: 'anual' },
          ]}
        />
      </div>

      <Tabs value={viewMode} onChange={onViewModeChange} defaultValue="table" theme={theme} className="w-full sm:w-auto">
        <TabsList variant="glass" className="w-full sm:w-auto">
          <TabsTrigger value="table" className="flex-1 sm:flex-none gap-2 px-6">
            <TableIcon size={16} />
            <span className="hidden sm:inline">Table</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 sm:flex-none gap-2 px-6">
            <CalendarDays size={16} />
            <span className="hidden sm:inline">Weekly</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 sm:flex-none gap-2 px-6">
            <Calendar size={16} />
            <span className="hidden sm:inline">Monthly</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
