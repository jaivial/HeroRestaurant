import { Text, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui';
import { safeParseDate, formatMinutes, formatTime } from '@/utils/time';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { cn } from '@/utils/cn';
import type { ShiftHistoryItem, MemberShiftStats } from '../../../types';
import { WeeklyCalendar } from '../../../../Shifts/components/StatsDashboard/ui/WeeklyCalendar';
import { MonthlyCalendar } from '../../../../Shifts/components/StatsDashboard/ui/MonthlyCalendar';

interface ShiftHistorySectionProps {
  stats: MemberShiftStats | null;
  viewMode: string;
  isDark: boolean;
}

export function ShiftHistorySection({ stats, viewMode, isDark }: ShiftHistorySectionProps) {
  const timeFormat = useAtomValue(timeFormatAtom);
  const use24h = timeFormat === '24h';

  const historyColumns: Column<ShiftHistoryItem>[] = [
    {
      header: 'Date',
      key: 'punchInAt',
      render: (s) => safeParseDate(s.punchInAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      header: 'Punch In',
      key: 'punchInAtTime',
      render: (s) => formatTime(s.punchInAt, use24h)
    },
    {
      header: 'Punch Out',
      key: 'punchOutAt',
      render: (s) => s.punchOutAt 
        ? formatTime(s.punchOutAt, use24h)
        : <span className={cn(
            "font-bold",
            isDark ? "text-[#28A745]" : "text-[#1E7E34]"
          )}>
            Active
          </span>
    },
    {
      header: 'Duration',
      key: 'totalMinutes',
      render: (s) => s.totalMinutes ? formatMinutes(s.totalMinutes) : '-'
    }
  ];

  return (
    <section className="space-y-3 h-full flex flex-col min-h-[400px]">
      <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
        Recent Shift History
      </Text>
      
      {viewMode === 'table' ? (
        <DataTable 
          data={stats?.history || []} 
          columns={historyColumns}
          className="text-[14px] flex-1"
          theme={isDark ? 'dark' : 'light'}
          emptyMessage="No shifts recorded yet."
        />
      ) : (
        <div className="flex-1 overflow-hidden">
          {viewMode === 'weekly' && (
            <WeeklyCalendar history={stats?.history || []} isDark={isDark} />
          )}
          {viewMode === 'monthly' && (
            <MonthlyCalendar history={stats?.history || []} isDark={isDark} />
          )}
        </div>
      )}
    </section>
  );
}
