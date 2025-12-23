import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';
import type { ScheduledShift, NewScheduledShift } from '../types';
import type { WSMessageCategory } from '@/websocket/types';

export function useShiftAssignment(restaurantId: string) {
  const isConnected = useAtomValue(isConnectedAtom);
  const [shifts, setShifts] = useState<ScheduledShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
  });

  const fetchScheduledShifts = useCallback(async () => {
    if (!isConnected || !restaurantId) return;

    setIsLoading(true);
    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'get_scheduled_shifts', { 
        restaurantId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setShifts(response.shifts);
    } catch (error) {
      console.error('Failed to fetch scheduled shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, dateRange]);

  const assignShift = useCallback(async (shiftData: NewScheduledShift) => {
    if (!isConnected || !restaurantId) return;

    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'assign', { 
        restaurantId,
        shiftData
      });
      setShifts(prev => [...prev, response.shift]);
      return response.shift;
    } catch (error) {
      console.error('Failed to assign shift:', error);
      throw error;
    }
  }, [isConnected, restaurantId]);

  const removeShift = useCallback(async (shiftId: string) => {
    if (!isConnected || !restaurantId) return;

    try {
      await wsClient.request<any>('shift' as WSMessageCategory, 'remove_scheduled', { 
        restaurantId,
        shiftId
      });
      setShifts(prev => prev.filter(s => s.id !== shiftId));
    } catch (error) {
      console.error('Failed to remove shift:', error);
      throw error;
    }
  }, [isConnected, restaurantId]);

  useEffect(() => {
    fetchScheduledShifts();
  }, [fetchScheduledShifts]);

  // Real-time listener for scheduled shift updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = wsClient.onMessage((event) => {
      if ((event.category as string) === 'shift' && event.event === 'scheduled_updated') {
        fetchScheduledShifts();
      }
    });

    return () => unsubscribe();
  }, [isConnected, fetchScheduledShifts]);

  return {
    shifts,
    isLoading,
    dateRange,
    setDateRange,
    assignShift,
    removeShift,
    refresh: fetchScheduledShifts,
  };
}
