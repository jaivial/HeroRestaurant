import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { workspaceIdAtom } from '@/atoms/workspaceAtoms';
import { wsClient } from '@/websocket';
import type { WSMessageCategory } from '@/websocket/types';
import type { MemberShiftStats, MemberShiftStatus, ShiftPeriod } from '../types';

export function useMemberShifts(memberId: string) {
  const isConnected = useAtomValue(isConnectedAtom);
  const restaurantId = useAtomValue(workspaceIdAtom);
  
  const [stats, setStats] = useState<MemberShiftStats | null>(null);
  const [status, setStatus] = useState<MemberShiftStatus>({ isPunchedIn: false, activeShift: null });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<ShiftPeriod>('monthly');

  const fetchShifts = useCallback(async () => {
    if (!isConnected || !restaurantId || !memberId) return;

    setIsLoading(true);
    try {
      const [statsRes, statusRes] = await Promise.all([
        wsClient.request<MemberShiftStats>('shift' as WSMessageCategory, 'get_personal_stats', {
          restaurantId,
          memberId,
          period,
        }),
        wsClient.request<MemberShiftStatus>('shift' as WSMessageCategory, 'get_status', {
          restaurantId,
          memberId,
        })
      ]);

      // Transform history from snake_case to camelCase
      if (statsRes.history) {
        statsRes.history = statsRes.history.map((s: any) => ({
          id: s.id,
          punchInAt: s.punch_in_at || s.punchInAt,
          punchOutAt: s.punch_out_at || s.punchOutAt,
          totalMinutes: s.total_minutes || s.totalMinutes,
          notes: s.notes
        }));
      }

      // Transform activeShift if exists
      if (statusRes.activeShift) {
        const s = statusRes.activeShift as any;
        statusRes.activeShift = {
          id: s.id,
          punchInAt: s.punch_in_at || s.punchInAt,
          punchOutAt: s.punch_out_at || s.punchOutAt,
          totalMinutes: s.total_minutes || s.totalMinutes,
          notes: s.notes
        };
      }

      setStats(statsRes);
      setStatus(statusRes);
    } catch (error) {
      console.error('Failed to fetch member shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, memberId, period]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    stats,
    status,
    isLoading,
    period,
    setPeriod,
    refresh: fetchShifts,
  };
}
