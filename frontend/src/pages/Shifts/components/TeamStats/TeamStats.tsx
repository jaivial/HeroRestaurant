// frontend/src/pages/Shifts/components/TeamStats/TeamStats.tsx

import { useMemo } from 'react';
import { DataTable, Badge, IconButton, Select, Heading, Text } from '@/components/ui';
import type { Column } from '@/components/ui';
import type { TeamStatsProps, MemberShiftSummary, ShiftPeriod } from '../../types';
import { MemberDetailModal } from '../MemberDetailModal/MemberDetailModal';
import { Eye } from 'lucide-react';
import { useTeamStats } from '../../hooks/useTeamStats';

export function TeamStats({ restaurantId }: TeamStatsProps) {
  const {
    period,
    setPeriod,
    members,
    isLoading,
    selectedMemberId,
    setSelectedMemberId,
    periodLabel
  } = useTeamStats(restaurantId);

  const columns = useMemo<Column<MemberShiftSummary>[]>(() => [
    {
      header: 'Member',
      key: 'name',
      render: (m) => (
        <div className="flex flex-col">
          <Text weight="semibold">{m.name}</Text>
          <Text variant="footnote" color="tertiary">{m.email}</Text>
        </div>
      )
    },
    {
      header: `${periodLabel} Hours`,
      key: 'totalWorkedThisWeek',
      render: (m) => `${(m.totalWorkedThisWeek / 60).toFixed(1)}h`
    },
    {
      header: 'Bank Balance',
      key: 'totalBankOfHours',
      render: (m) => {
        const hours = (m.totalBankOfHours / 60).toFixed(1);
        const prefix = m.totalBankOfHours > 0 ? '+' : '';
        return `${prefix}${hours}h`;
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (m) => {
        const variants = {
          healthy: 'success',
          caution: 'info',
          overworked: 'warning',
          critical: 'error'
        } as const;

        const labels = {
          healthy: 'Healthy',
          caution: 'Caution',
          overworked: 'Overworked',
          critical: 'Critical'
        };

        return (
          <Badge variant={variants[m.status]} dot>
            {labels[m.status]}
          </Badge>
        );
      }
    },
    {
      header: '',
      key: 'actions',
      render: (m) => (
        <IconButton 
          icon={<Eye size={18} />}
          variant="plain" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMemberId(m.id);
          }} 
        />
      )
    }
  ], [periodLabel, setSelectedMemberId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <Heading level={1}>Team Performance</Heading>
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
      
      <DataTable 
        data={members} 
        columns={columns} 
        isLoading={isLoading}
        onRowClick={(m) => setSelectedMemberId(m.id)}
      />

      {selectedMemberId && (
        <MemberDetailModal 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)} 
        />
      )}
    </div>
  );
}
