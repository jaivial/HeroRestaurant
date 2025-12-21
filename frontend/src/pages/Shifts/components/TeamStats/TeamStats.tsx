// frontend/src/pages/Shifts/components/TeamStats/TeamStats.tsx

import { useMemo, useState } from 'react';
import { DataTable, Badge, IconButton } from '@/components/ui';
import type { Column } from '@/components/ui';
import type { TeamStatsProps, MemberShiftSummary } from '../../types';
import { useTeamShifts } from '../../hooks/useTeamShifts';
import { MemberDetailModal } from './ui/MemberDetailModal';
import { Eye } from 'lucide-react';

export function TeamStats({ restaurantId }: TeamStatsProps) {
  const { members, isLoading, filters: _filters, setFilters: _setFilters } = useTeamShifts(restaurantId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const columns = useMemo<Column<MemberShiftSummary>[]>(() => [
    {
      header: 'Member',
      key: 'name',
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-semibold">{m.name}</span>
          <span className="text-[13px] opacity-50">{m.email}</span>
        </div>
      )
    },
    {
      header: 'Weekly Hours',
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
  ], []);

  return (
    <div className="space-y-6">
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

