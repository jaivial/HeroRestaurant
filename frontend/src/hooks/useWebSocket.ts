import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import {
  connectionStatusAtom,
  isConnectedAtom,
  isAuthenticatedWSAtom,
  reconnectAttemptAtom,
  lastErrorAtom,
} from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';

/**
 * Hook to access WebSocket connection state and controls
 */
export function useWebSocket() {
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const isConnected = useAtomValue(isConnectedAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedWSAtom);
  const reconnectAttempt = useAtomValue(reconnectAttemptAtom);
  const lastError = useAtomValue(lastErrorAtom);

  return {
    connectionStatus,
    isConnected,
    isAuthenticated,
    reconnectAttempt,
    lastError,
    connect: () => wsClient.connect(),
    disconnect: () => wsClient.disconnect(),
  };
}

/**
 * Initialize WebSocket connection on app mount
 * Should be called once at app root level
 */
export function useWebSocketInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);
}
