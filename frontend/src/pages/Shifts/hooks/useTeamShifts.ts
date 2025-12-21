import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';
import type { MemberShiftSummary } from '../types';
import type { WSMessageCategory } from '@/websocket/types';

export function useTeamShifts(restaurantId: string) {
  const isConnected = useAtomValue(isConnectedAtom);
  const [members, setMembers] = useState<MemberShiftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchTeamStats = useCallback(async () => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'get_team_stats', { 
        restaurantId,
        ...filters 
      });
      setMembers(response.members);
    } catch (error) {
      console.error('Failed to fetch team stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, filters]);

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  // Real-time listener for shift updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = wsClient.onMessage((event) => {
      if ((event.category as string) === 'shift' && event.event === 'status_updated') {
        fetchTeamStats();
      }
    });

    return () => unsubscribe();
  }, [isConnected, fetchTeamStats]);

  return {
    members,
    isLoading,
    filters,
    setFilters,
    refresh: fetchTeamStats,
  };
}

