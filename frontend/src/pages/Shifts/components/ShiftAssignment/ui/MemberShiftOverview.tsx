import { useMemo, useState } from 'react';
import { 
  Card, 
  Text, 
  Heading, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  Button,
  DataTable
} from '@/components/ui';
import type { Column } from '@/components/ui';
import { useMemberShiftDetail } from '../../../hooks/useMemberShiftDetail';
import { WeeklyCalendar } from '../../StatsDashboard/ui/WeeklyCalendar';
import { MonthlyCalendar } from '../../StatsDashboard/ui/MonthlyCalendar';
import { Plus, Table as TableIcon, Calendar, CalendarDays, Activity, BarChart3 } from 'lucide-react';
import { formatMinutes, formatTime } from '@/utils/time';
import type { ShiftHistoryItem } from '../../../types';

interface MemberShiftOverviewProps {
  memberId: string;
  memberName: string;
  restaurantId: string;
  onQuickAssign: () => void;
}

export function MemberShiftOverview({ memberId, memberName, onQuickAssign }: MemberShiftOverviewProps) {
  const [viewMode, setViewMode] = useState('weekly');
  const { data, isLoading } = useMemberShiftDetail(memberId);

  const historyColumns: Column<ShiftHistoryItem>[] = useMemo(() => [
    {
      header: 'Date',
      key: 'punchInAt',
      render: (s) => new Date(s.punchInAt).toLocaleDateString()
    },
    {
      header: 'Punch In',
      key: 'punchInAtTime',
      render: (s) => formatTime(s.punchInAt, true)
    },
    {
      header: 'Punch Out',
      key: 'punchOutAt',
      render: (s) => s.punchOutAt ? formatTime(s.punchOutAt, true) : '-'
    },
    {
      header: 'Duration',
      key: 'totalMinutes',
      render: (s) => s.totalMinutes ? `${formatMinutes(s.totalMinutes)}h` : 'Active'
    }
  ], []);

  if (isLoading) {
    return <div className="p-12 text-center opacity-50">Loading member details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Heading level={2}>{memberName}</Heading>
          <Text color="secondary">Shift overview and history</Text>
        </div>
        <Button onClick={onQuickAssign} className="flex items-center gap-2">
          <Plus size={18} />
          Quick Assign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Text variant="caption" weight="bold" className="uppercase opacity-50 mb-1">Worked (Year)</Text>
          <Text variant="title2" weight="bold">{(data?.workedMinutes / 60 || 0).toFixed(1)}h</Text>
        </Card>
        <Card className="p-4">
          <Text variant="caption" weight="bold" className="uppercase opacity-50 mb-1">Bank Balance</Text>
          <Text variant="title2" weight="bold" className={data?.differenceMinutes >= 0 ? 'text-systemGreen' : 'text-systemRed'}>
            {(data?.differenceMinutes / 60 || 0).toFixed(1)}h
          </Text>
        </Card>
        <Card className="p-4">
          <Text variant="caption" weight="bold" className="uppercase opacity-50 mb-1">Scheduled</Text>
          <Text variant="title2" weight="bold">{data?.scheduled?.length || 0} shifts</Text>
        </Card>
      </div>

      <Tabs value={viewMode} onChange={setViewMode} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList variant="glass">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TableIcon size={16} />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Activity size={16} />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>Analysis</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly">
          <WeeklyCalendar history={data?.history || []} isConstrained />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyCalendar history={data?.history || []} />
        </TabsContent>
        <TabsContent value="history">
          <DataTable data={data?.history || []} columns={historyColumns} />
        </TabsContent>
        <TabsContent value="heatmap">
          <div className="p-8 text-center border rounded-[2.2rem] opacity-50 italic">
            Heatmap view coming soon - Visualizing busy hours and peak performance.
          </div>
        </TabsContent>
        <TabsContent value="comparison">
          <div className="p-8 text-center border rounded-[2.2rem] opacity-50 italic">
            Comparison view coming soon - Benchmarking member stats against team averages.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
