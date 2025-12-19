import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import {
  connectionStatusAtom,
  reconnectAttemptAtom,
  lastErrorAtom,
} from '@/atoms/websocketAtoms';
import { getReconnectionMessage, MAX_RECONNECT_ATTEMPTS } from '@/websocket';

/**
 * Hook for getting user-friendly connection status information
 */
export function useConnectionStatus() {
  const status = useAtomValue(connectionStatusAtom);
  const reconnectAttempt = useAtomValue(reconnectAttemptAtom);
  const lastError = useAtomValue(lastErrorAtom);

  const statusMessage = useMemo(() => {
    switch (status) {
      case 'disconnected':
        return lastError || 'Disconnected';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'authenticating':
        return 'Authenticating...';
      case 'authenticated':
        return 'Ready';
      case 'reconnecting':
        return getReconnectionMessage(reconnectAttempt);
      default:
        return 'Unknown';
    }
  }, [status, reconnectAttempt, lastError]);

  const canRetry = useMemo(() => {
    return status === 'disconnected' && reconnectAttempt >= MAX_RECONNECT_ATTEMPTS;
  }, [status, reconnectAttempt]);

  return {
    status,
    statusMessage,
    reconnectAttempt,
    lastError,
    canRetry,
    isHealthy: status === 'authenticated',
    isPartiallyHealthy: status === 'connected',
    isUnhealthy: status === 'disconnected' || status === 'reconnecting',
  };
}
