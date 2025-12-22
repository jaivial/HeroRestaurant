import { useState } from 'react';
import { usePersonalStats } from '../../hooks/usePersonalStats';
import { Card, Text, Heading, Select, Badge, DataTable, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import type { Column } from '@/components/ui';
import type { ShiftPeriod, ShiftHistoryItem } from '../../types';
import { Clock, TrendingUp, ShieldCheck, Table as TableIcon, Calendar, CalendarDays } from 'lucide-react';
import { WeeklyCalendar } from './ui/WeeklyCalendar';
import { MonthlyCalendar } from './ui/MonthlyCalendar';
import { safeParseDate, formatMinutes, formatTime } from '@/utils/time';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

interface StatsDashboardProps {
  restaurantId: string;
}

export function StatsDashboard({ restaurantId }: StatsDashboardProps) {
  const { stats: periodStats, isLoading: statsLoading, period, setPeriod } = usePersonalStats(restaurantId, 'monthly');
  const { stats: fullHistoryStats } = usePersonalStats(restaurantId, 'anual');
  const [viewMode, setViewMode] = useState('table');
  const timeFormat = useAtomValue(timeFormatAtom);
  const theme = useAtomValue(themeAtom);
  const use24h = timeFormat === '24h';
  const isDark = theme === 'dark';

  const historyColumns: Column<ShiftHistoryItem>[] = [
// ... (rest of columns) ...
    {
      header: 'Date',
      key: 'punchInAt',
      render: (s) => safeParseDate(s.punchInAt).toLocaleDateString()
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
        : '-'
    },
    {
      header: 'Duration',
      key: 'totalMinutes',
      render: (s) => s.totalMinutes ? `${formatMinutes(s.totalMinutes)}h` : 'Active'
    }
  ];

  if (statsLoading && !periodStats) {
    return <div className={cn(
      "p-12 text-center",
      isDark ? "text-white/50" : "text-black/50"
    )}>Loading statistics...</div>;
  }

  const hoursWorked = periodStats ? (periodStats.workedMinutes / 60).toFixed(1) : '0.0';
  const hoursContracted = periodStats ? (periodStats.contractedMinutes / 60).toFixed(1) : '0.0';
  const diff = periodStats ? (periodStats.differenceMinutes / 60).toFixed(1) : '0.0';
  const isPositive = periodStats ? periodStats.differenceMinutes >= 0 : true;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Heading level={2} className={cn(
          "text-[34px] font-bold leading-tight",
          isDark ? "text-white" : "text-black"
        )}>Performance Overview</Heading>
        <div className="w-full md:w-48">
          <Select
            value={period}
            onChange={(val) => setPeriod(val as ShiftPeriod)}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className={cn(
          "p-6",
          isDark ? "bg-white/5" : "bg-white"
        )}>
          <div className="flex justify-between items-start mb-4">
            <Text className={cn(
              "text-[13px] font-bold uppercase tracking-wider",
              isDark ? "text-white/60" : "text-black/60"
            )}>Hours Worked</Text>
            <Clock size={18} className={isDark ? "text-white/40" : "text-black/40"} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-[34px] font-bold",
              isDark ? "text-white" : "text-black"
            )}>{hoursWorked}h</span>
            <span className={isDark ? "text-white/40 text-sm" : "text-black/40 text-sm"}>/ {hoursContracted}h</span>
          </div>
        </Card>

        <Card className={cn(
          "p-6",
          isDark ? "bg-white/5" : "bg-white"
        )}>
          <div className="flex justify-between items-start mb-4">
            <Text className={cn(
              "text-[13px] font-bold uppercase tracking-wider",
              isDark ? "text-white/60" : "text-black/60"
            )}>Bank Balance</Text>
            <TrendingUp size={18} className={isDark ? "text-white/40" : "text-black/40"} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-[34px] font-bold",
              isPositive 
                ? (isDark ? 'text-[#30D158]' : 'text-[#34C759]') 
                : (isDark ? 'text-[#FF453A]' : 'text-[#FF3B30]')
            )}>
              {isPositive ? '+' : ''}{diff}h
            </span>
          </div>
        </Card>

        <Card className={cn(
          "p-6 sm:col-span-2 md:col-span-1",
          isDark ? "bg-white/5" : "bg-white"
        )}>
          <div className="flex justify-between items-start mb-4">
            <Text className={cn(
              "text-[13px] font-bold uppercase tracking-wider",
              isDark ? "text-white/60" : "text-black/60"
            )}>Status</Text>
            <ShieldCheck size={18} className={isDark ? "text-white/40" : "text-black/40"} />
          </div>
          <div>
            <Badge variant={periodStats?.status === 'healthy' ? 'success' : periodStats?.status === 'caution' ? 'info' : 'warning'} size="lg">
              {periodStats?.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <Heading level={3} className={cn(
          "text-[28px] font-semibold leading-snug",
          isDark ? "text-white" : "text-black"
        )}>Shift History</Heading>
        <Tabs value={viewMode} onChange={setViewMode} defaultValue="table" className="w-full md:w-auto">
          <TabsList variant="glass" className="w-full md:w-auto">
            <TabsTrigger value="table" className="flex-1 md:flex-none gap-2 px-6">
              <TableIcon size={16} />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 md:flex-none gap-2 px-6">
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 md:flex-none gap-2 px-6">
              <Calendar size={16} />
              <span className="hidden sm:inline">Monthly</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8">
        {viewMode === 'table' && (
          <DataTable 
            data={periodStats?.history || []} 
            columns={historyColumns} 
          />
        )}
        {viewMode === 'weekly' && (
          <WeeklyCalendar history={fullHistoryStats?.history || []} />
        )}
        {viewMode === 'monthly' && (
          <MonthlyCalendar history={fullHistoryStats?.history || []} />
        )}
      </div>
    </div>
  );
}

