// frontend/src/pages/Shifts/components/MemberShiftOverview/MemberShiftOverview.tsx

import { useMemo, useEffect, useState, useCallback } from 'react';
import type { Column } from '@/components/ui';
import type { ScheduledShift, ShiftHistoryItem } from '../../types';
import { useMemberShiftDetail } from '../../hooks/useMemberShiftDetail';
import { useShiftAssignment } from '../../hooks/useShiftAssignment';
import { formatMinutes, formatTime } from '@/utils/time';
import { wsClient } from '@/websocket';
import { MemberShiftOverviewUI } from './ui/MemberShiftOverviewUI';
import { EditShiftModal } from '../EditShiftModal/EditShiftModal';
import { useTeamShifts } from '../../hooks/useTeamShifts';

import { shiftsHistoryTabPreferenceAtom } from '@/atoms/preferenceAtoms';
import { useAtom } from 'jotai';

interface MemberShiftOverviewProps {
  memberId: string;
  memberName: string;
  restaurantId: string;
  onQuickAssign: () => void;
}

export function MemberShiftOverview({ memberId, memberName, restaurantId, onQuickAssign }: MemberShiftOverviewProps) {
  const [viewMode, setViewMode] = useAtom(shiftsHistoryTabPreferenceAtom);
  const { data, isLoading, refresh } = useMemberShiftDetail(memberId);
  const { updateShift, removeShift } = useShiftAssignment(restaurantId);
  const { members } = useTeamShifts(restaurantId);

  const [selectedShift, setSelectedShift] = useState<ScheduledShift | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Listen for scheduled shift updates
  useEffect(() => {
    const unsubscribe = wsClient.onMessage((event) => {
      if (event.category === 'shift' && event.event === 'scheduled_updated') {
        // Refresh if the update is for this restaurant
        if (event.restaurantId === restaurantId) {
          refresh();
        }
      }
    });

    return () => unsubscribe();
  }, [restaurantId, refresh]);

  const handleShiftClick = useCallback((shift: ScheduledShift | ShiftHistoryItem, type: 'scheduled' | 'history') => {
    if (type === 'scheduled') {
      setSelectedShift(shift as ScheduledShift);
      setIsEditModalOpen(true);
    }
    // For history shifts, we could add a preview modal later if needed
  }, []);

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

  return (
    <>
      <MemberShiftOverviewUI 
        memberId={memberId}
        memberName={memberName}
        restaurantId={restaurantId}
        isLoading={isLoading}
        data={data}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onQuickAssign={onQuickAssign}
        historyColumns={historyColumns}
        onShiftClick={handleShiftClick}
      />

      {isEditModalOpen && selectedShift && (
        <EditShiftModal 
          shift={selectedShift}
          members={members}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedShift(null);
          }}
          onUpdate={(shiftData) => updateShift(selectedShift.id, shiftData)}
          onRemove={removeShift}
        />
      )}
    </>
  );
}
