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

interface StatsDashboardProps {
  restaurantId: string;
}

export function StatsDashboard({ restaurantId }: StatsDashboardProps) {
  const { stats: periodStats, isLoading: statsLoading, period, setPeriod } = usePersonalStats(restaurantId);
  const { stats: fullHistoryStats } = usePersonalStats(restaurantId, 'anual');
  const [viewMode, setViewMode] = useState('table');
  const timeFormat = useAtomValue(timeFormatAtom);
  const use24h = timeFormat === '24h';

  const historyColumns: Column<ShiftHistoryItem>[] = [
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
      render: (s) => s.totalMinutes ? formatMinutes(s.totalMinutes) : 'Active'
    }
  ];

  if (statsLoading && !periodStats) {
    return <div className="p-12 text-center opacity-50">Loading statistics...</div>;
  }

  const hoursWorked = periodStats ? (periodStats.workedMinutes / 60).toFixed(1) : '0.0';
  const hoursContracted = periodStats ? (periodStats.contractedMinutes / 60).toFixed(1) : '0.0';
  const diff = periodStats ? (periodStats.differenceMinutes / 60).toFixed(1) : '0.0';
  const isPositive = periodStats ? periodStats.differenceMinutes >= 0 : true;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Heading level={2} className="text-[28px] md:text-[34px]">Performance Overview</Heading>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <Text className="opacity-60 text-[11px] md:text-[13px] font-bold uppercase tracking-wider">Hours Worked</Text>
            <Clock size={18} className="opacity-40" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] md:text-[34px] font-bold">{hoursWorked}h</span>
            <span className="opacity-40 text-sm">/ {hoursContracted}h</span>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <Text className="opacity-60 text-[11px] md:text-[13px] font-bold uppercase tracking-wider">Bank Balance</Text>
            <TrendingUp size={18} className="opacity-40" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-[28px] md:text-[34px] font-bold ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
              {isPositive ? '+' : ''}{diff}h
            </span>
          </div>
        </Card>

        <Card className="p-4 md:p-6 sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <Text className="opacity-60 text-[11px] md:text-[13px] font-bold uppercase tracking-wider">Status</Text>
            <ShieldCheck size={18} className="opacity-40" />
          </div>
          <div>
            <Badge variant={periodStats?.status === 'healthy' ? 'success' : periodStats?.status === 'caution' ? 'info' : 'warning'} size="lg">
              {periodStats?.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <Heading level={3} className="text-[22px] md:text-[28px]">Shift History</Heading>
        <Tabs value={viewMode} onChange={setViewMode} defaultValue="table" className="w-full md:w-auto">
          <TabsList variant="glass" className="w-full md:w-auto">
            <TabsTrigger value="table" className="flex-1 md:flex-none gap-2 px-3 md:px-6">
              <TableIcon size={16} />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 md:flex-none gap-2 px-3 md:px-6">
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 md:flex-none gap-2 px-3 md:px-6">
              <Calendar size={16} />
              <span className="hidden sm:inline">Monthly</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
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

