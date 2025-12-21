import { useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { shiftStatusAtom } from '@/atoms/shiftAtoms';
import type { ShiftStatus } from '@/atoms/shiftAtoms';
import { wsClient } from '@/websocket';
import { useToast } from '@/components/ui';
import type { WSMessageCategory } from '@/websocket/types';

export function useClock(restaurantId: string) {
  const isConnected = useAtomValue(isConnectedAtom);
  const { addToast } = useToast();
  const [status, setStatus] = useAtom(shiftStatusAtom);
  const [isLoading, setIsLoading] = useState(true);

  const getStatus = useCallback(async () => {
    if (!isConnected || !restaurantId) return;

    try {
      const response = await wsClient.request<ShiftStatus>('shift' as WSMessageCategory, 'get_status', { restaurantId });
      setStatus(response);
    } catch (error) {
      console.error('Failed to get shift status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, restaurantId, setStatus]);

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  const punch = useCallback(async (action: 'in' | 'out', notes?: string) => {
    if (!isConnected || !restaurantId) return;

    // Optimistic update
    const previousStatus = { ...status };
    setStatus(prev => ({
      ...prev,
      isPunchedIn: action === 'in',
    }));

    try {
      const response = await wsClient.request<any>('shift' as WSMessageCategory, 'punch', {
        restaurantId,
        action,
        notes,
      });

      setStatus({
        isPunchedIn: action === 'in',
        activeShift: action === 'in' ? response.shift : null,
      });
      
      addToast({
        title: action === 'in' ? 'Punched In' : 'Punched Out',
        type: 'success',
      });
    } catch (error: any) {
      // Rollback
      setStatus(previousStatus);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to punch',
        type: 'error',
      });
    }
  }, [isConnected, restaurantId, status, setStatus, addToast]);

  return {
    status,
    isLoading,
    punchIn: () => punch('in'),
    punchOut: (notes?: string) => punch('out', notes),
  };
}
