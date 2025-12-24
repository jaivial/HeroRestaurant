// frontend/src/pages/Shifts/components/MemberShiftOverview/ui/MemberShiftOverviewUI.tsx

import { memo } from 'react';
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
import { WeeklyCalendar } from '../../WeeklyCalendar/WeeklyCalendar';
import { MonthlyCalendar } from '../../MonthlyCalendar/MonthlyCalendar';
import { Plus, Table as TableIcon, Calendar, CalendarDays, Activity, BarChart3 } from 'lucide-react';
import type { ShiftHistoryItem, ScheduledShift } from '../../../types';
import type { Column } from '@/components/ui';
import { MemberActivityHeatmap } from '../../MemberActivityHeatmap/MemberActivityHeatmap';
import { MemberAnalysis } from '../../MemberAnalysis/MemberAnalysis';

interface MemberShiftOverviewUIProps {
  memberId: string;
  memberName: string;
  restaurantId: string;
  isLoading: boolean;
  data: {
    history: ShiftHistoryItem[];
    scheduled: ScheduledShift[];
    workedMinutes: number;
    differenceMinutes: number;
  } | null;
  viewMode: string;
  setViewMode: (mode: string) => void;
  onQuickAssign: () => void;
  historyColumns: Column<ShiftHistoryItem>[];
  onShiftClick?: (shift: ScheduledShift | ShiftHistoryItem, type: 'scheduled' | 'history') => void;
}

export const MemberShiftOverviewUI = memo(function MemberShiftOverviewUI({
  memberId,
  memberName,
  restaurantId,
  isLoading,
  data,
  viewMode,
  setViewMode,
  onQuickAssign,
  historyColumns,
  onShiftClick
}: MemberShiftOverviewUIProps) {
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
          <Text variant="title2" weight="bold">{(data?.workedMinutes ? data.workedMinutes / 60 : 0).toFixed(1)}h</Text>
        </Card>
        <Card className="p-4">
          <Text variant="caption" weight="bold" className="uppercase opacity-50 mb-1">Bank Balance</Text>
          <Text variant="title2" weight="bold" className={(data?.differenceMinutes || 0) >= 0 ? 'text-apple-green' : 'text-apple-red'}>
            {(data?.differenceMinutes ? data.differenceMinutes / 60 : 0).toFixed(1)}h
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
          <WeeklyCalendar 
            history={data?.history || []} 
            scheduled={data?.scheduled || []}
            isConstrained 
            onShiftClick={onShiftClick}
          />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyCalendar history={data?.history || []} />
        </TabsContent>
        <TabsContent value="history">
          <DataTable data={data?.history || []} columns={historyColumns} />
        </TabsContent>
        <TabsContent value="heatmap">
          <MemberActivityHeatmap history={data?.history || []} />
        </TabsContent>
        <TabsContent value="comparison">
          <MemberAnalysis 
            memberId={memberId}
            restaurantId={restaurantId}
            memberStats={{
              workedMinutes: data?.workedMinutes || 0,
              differenceMinutes: data?.differenceMinutes || 0
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});
