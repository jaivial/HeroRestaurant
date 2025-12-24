// frontend/src/pages/Shifts/components/MemberDetailModal/MemberDetailModal.tsx

import { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { useMemberShiftDetail } from '../../hooks/useMemberShiftDetail';
import type { ShiftHistoryItem, ShiftPeriod } from '../../types';
import { safeParseDate, formatMinutes, formatTime } from '@/utils/time';
import { Badge } from '@/components/ui';
import type { Column } from '@/components/ui';
import { MemberDetailModalUI } from './ui/MemberDetailModalUI';

interface MemberDetailModalProps {
  memberId: string;
  onClose: () => void;
}

export function MemberDetailModal({ memberId, onClose }: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<ShiftPeriod>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useMemberShiftDetail(memberId);
  const timeFormat = useAtomValue(timeFormatAtom);
  const theme = useAtomValue(themeAtom);
  const use24h = timeFormat === '24h';
  const isDark = theme === 'dark';

  const filteredHistory = useMemo(() => {
    if (!data?.history) return [];
    let filtered = data.history;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s: ShiftHistoryItem) => 
        safeParseDate(s.punchInAt).toLocaleDateString().toLowerCase().includes(query) ||
        (s.totalMinutes && formatMinutes(s.totalMinutes).includes(query))
      );
    }
    
    return filtered;
  }, [data?.history, searchQuery]);

  const historyColumns: Column<ShiftHistoryItem>[] = useMemo(() => [
    {
      header: 'Date',
      key: 'punchInAt',
      render: (s) => (
        <div className="flex items-center gap-2">
          <span>{safeParseDate(s.punchInAt).toLocaleDateString()}</span>
        </div>
      )
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
        : <Badge variant="info" size="sm">Active</Badge>
    },
    {
      header: 'Total',
      key: 'totalMinutes',
      render: (s) => s.totalMinutes ? `${formatMinutes(s.totalMinutes)}h` : '-'
    }
  ], [use24h]);

  return (
    <MemberDetailModalUI 
      onClose={onClose}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      period={period}
      setPeriod={setPeriod}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isLoading}
      data={data}
      isDark={isDark}
      filteredHistory={filteredHistory}
      historyColumns={historyColumns}
    />
  );
}
