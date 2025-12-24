// frontend/src/pages/Shifts/components/TeamStats/ui/MemberDetailModalUI.tsx

import { memo } from 'react';
import { 
  Modal, 
  Text, 
  Badge, 
  DataTable, 
  Button, 
  ModalFooter, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  Select, 
  Input, 
  Heading 
} from '@/components/ui';
import { Clock, Briefcase, Activity, Calendar, List, BarChart3, Filter, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ShiftHistoryItem, ShiftPeriod } from '../../../types';
import type { Column } from '@/components/ui';

interface MemberDetailModalUIProps {
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  period: ShiftPeriod;
  setPeriod: (period: ShiftPeriod) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  data: any;
  isDark: boolean;
  filteredHistory: ShiftHistoryItem[];
  historyColumns: Column<ShiftHistoryItem>[];
}

export const MemberDetailModalUI = memo(function MemberDetailModalUI({
  onClose,
  activeTab,
  setActiveTab,
  period,
  setPeriod,
  searchQuery,
  setSearchQuery,
  isLoading,
  data,
  isDark,
  filteredHistory,
  historyColumns
}: MemberDetailModalUIProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Member Shift Analytics"
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={activeTab} onChange={setActiveTab} className="w-full md:w-auto">
            <TabsList variant="glass">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <List size={16} /> Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar size={16} /> History
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 size={16} /> Statistics
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <Filter size={14} className="opacity-40" />
              <Text variant="caption1" weight="semibold">Period:</Text>
            </div>
            <Select
              value={period}
              onChange={(val) => setPeriod(val as ShiftPeriod)}
              className="w-32"
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'anual' },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <Text align="center" color="tertiary" className="p-12">
            Gathering member insights...
          </Text>
        ) : !data ? (
          <Text align="center" color="red" className="p-12">
            Failed to load member shift details.
          </Text>
        ) : (
          <div className="min-h-[400px]">
            <Tabs value={activeTab}>
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={cn(
                    "p-6 rounded-[2.2rem] border backdrop-blur-[20px] saturate-[180%] transition-all hover:scale-[1.02]",
                    isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-full bg-apple-blue/10 text-apple-blue">
                        <Clock size={20} />
                      </div>
                      <Text variant="callout" weight="bold">Activity</Text>
                    </div>
                    <div className="space-y-1">
                      <Text variant="title1" weight="bold">{(data.workedMinutes / 60).toFixed(1)}h</Text>
                      <Text variant="caption1" color="tertiary">Total hours this period</Text>
                    </div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-[2.2rem] border backdrop-blur-[20px] saturate-[180%] transition-all hover:scale-[1.02]",
                    isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-full bg-apple-green/10 text-apple-green">
                        <Briefcase size={20} />
                      </div>
                      <Text variant="callout" weight="bold">Contract</Text>
                    </div>
                    <div className="space-y-1">
                      <Text variant="title1" weight="bold">{(data.contractedMinutes / 60).toFixed(1)}h</Text>
                      <Text variant="caption1" color="tertiary">Agreed working hours</Text>
                    </div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-[2.2rem] border backdrop-blur-[20px] saturate-[180%] transition-all hover:scale-[1.02]",
                    isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        data.status === 'healthy' ? "bg-apple-green/10 text-apple-green" : "bg-apple-orange/10 text-apple-orange"
                      )}>
                        <Activity size={20} />
                      </div>
                      <Text variant="callout" weight="bold">Status</Text>
                    </div>
                    <div className="space-y-3">
                      <Badge variant={data.status === 'healthy' ? 'success' : 'warning'} size="lg">
                        {data.status.toUpperCase()}
                      </Badge>
                      <Text variant="caption1" color="tertiary" className="block">Current performance index</Text>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "p-8 rounded-[2.2rem] border",
                  isDark ? "bg-white/5 border-white/10" : "bg-black/[0.02] border-black/[0.05]"
                )}>
                  <Heading level={3} className="mb-4">Quick Summary</Heading>
                  <Text variant="body" color="secondary">
                    In the current {period} period, the member has completed {(data.workedMinutes / 60).toFixed(1)} hours 
                    out of the contracted {(data.contractedMinutes / 60).toFixed(1)} hours. 
                    {data.workedMinutes > data.contractedMinutes 
                      ? " This indicates an overtime trend that should be monitored."
                      : " The member is currently within their contracted hour limits."}
                  </Text>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="mb-6">
                  <Input 
                    placeholder="Search by date or duration..." 
                    icon={<Search size={18} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <DataTable 
                  data={filteredHistory} 
                  columns={historyColumns} 
                  className="border-none shadow-none bg-transparent"
                  emptyMessage="No shift records found for this period."
                />
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Heading level={3}>Performance Metrics</Heading>
                    <div className="space-y-4">
                      {[
                        { label: 'Punctuality Rate', value: '98%', color: 'text-apple-green' },
                        { label: 'Avg. Shift Length', value: `${(data.workedMinutes / (data.history?.length || 1) / 60).toFixed(1)}h`, color: 'text-apple-blue' },
                        { label: 'Overtime Frequency', value: data.workedMinutes > data.contractedMinutes ? 'High' : 'Low', color: data.workedMinutes > data.contractedMinutes ? 'text-apple-red' : 'text-apple-green' },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                          <Text variant="body" weight="medium">{stat.label}</Text>
                          <Text variant="body" weight="bold" className={stat.color}>{stat.value}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <Heading level={3}>Work-Life Balance</Heading>
                    <div className={cn(
                      "p-6 rounded-[2.2rem] border-2 border-dashed flex flex-col items-center justify-center text-center",
                      isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/[0.01]"
                    )}>
                      <BarChart3 size={48} className="opacity-20 mb-4" />
                      <Text variant="body" color="secondary">
                        Detailed visualization of shift patterns will be available as more data is collected.
                      </Text>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button onClick={onClose} variant="secondary" className="px-8">
          Dismiss
        </Button>
      </ModalFooter>
    </Modal>
  );
});
