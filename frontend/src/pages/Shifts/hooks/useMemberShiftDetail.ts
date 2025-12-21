import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { workspaceIdAtom } from '@/atoms/workspaceAtoms';
import { wsClient } from '@/websocket';
import type { WSMessageCategory } from '@/websocket/types';

export function useMemberShiftDetail(memberId: string) {
  const isConnected = useAtomValue(isConnectedAtom);
  const restaurantId = useAtomValue(workspaceIdAtom);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    endDate: new Date().toISOString(),
  });

  const fetchDetail = useCallback(async () => {
    if (!isConnected || !restaurantId) return;

    setIsLoading(true);
    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'get_personal_stats', { 
        restaurantId,
        memberId, 
        period: 'monthly' 
      });

      // Transform history from snake_case to camelCase
      if (response.history) {
        response.history = response.history.map((s: any) => ({
          id: s.id,
          punchInAt: s.punch_in_at,
          punchOutAt: s.punch_out_at,
          totalMinutes: s.total_minutes,
          notes: s.notes
        }));
      }

      setData(response);
    } catch (error) {
      console.error('Failed to fetch member shift detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, memberId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    filters,
    setFilters,
    refresh: fetchDetail,
  };
}

