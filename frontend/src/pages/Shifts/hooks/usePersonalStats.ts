import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';
import type { ShiftPeriod } from '../types';
import type { WSMessageCategory } from '@/websocket/types';

export function usePersonalStats(restaurantId: string, initialPeriod: ShiftPeriod = 'weekly') {
  const isConnected = useAtomValue(isConnectedAtom);
  const [period, setPeriod] = useState<ShiftPeriod>(initialPeriod);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'get_personal_stats', { 
        restaurantId,
        period 
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

      setStats(response);
    } catch (error) {
      console.error('Failed to fetch personal stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    period,
    setPeriod,
    refresh: fetchStats,
  };
}

