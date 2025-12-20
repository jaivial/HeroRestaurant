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
    /**
     * Connect to WebSocket with authentication token
     * @param token - Session token from REST login
     */
    connect: (token?: string) => wsClient.connect(token),
    disconnect: () => wsClient.disconnect(),
  };
}

/**
 * Connect WebSocket after authentication
 * Should be called after successful REST login with the session token
 */
export function connectWebSocket(token: string): void {
  wsClient.connect(token);
}

/**
 * Disconnect WebSocket (on logout)
 */
export function disconnectWebSocket(): void {
  wsClient.disconnect();
}
