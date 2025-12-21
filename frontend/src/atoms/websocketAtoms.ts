import { atom } from 'jotai';

// ============================================================================
// Connection Status Types
// ============================================================================

export type ConnectionStatus =
  | 'disconnected'     // Not connected, not trying
  | 'connecting'       // Attempting to connect
  | 'connected'        // Connected but not authenticated
  | 'authenticating'   // Sending auth credentials
  | 'authenticated'    // Fully authenticated
  | 'reconnecting';    // Lost connection, trying to reconnect

// ============================================================================
// Pending Request Type
// ============================================================================

export interface PendingRequest {
  resolve: (_data: unknown) => void;
  reject: (_error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
  sentAt: number;
}

// ============================================================================
// Granular Connection State Atoms
// ============================================================================

/** Current connection status */
export const connectionStatusAtom = atom<ConnectionStatus>('disconnected');

/** Number of reconnection attempts */
export const reconnectAttemptAtom = atom<number>(0);

/** Timestamp of last successful connection */
export const lastConnectedAtAtom = atom<number | null>(null);

/** Last error message */
export const lastErrorAtom = atom<string | null>(null);

/** Session token for authentication */
export const sessionTokenAtom = atom<string | null>(null);

/** Pending requests awaiting response */
export const pendingRequestsAtom = atom<Map<string, PendingRequest>>(new Map());

// ============================================================================
// Derived Atoms
// ============================================================================

/** Is the WebSocket connected (authenticated or not) */
export const isConnectedAtom = atom((get) => {
  const status = get(connectionStatusAtom);
  return status === 'connected' || status === 'authenticated';
});

/** Is the WebSocket fully authenticated */
export const isAuthenticatedWSAtom = atom((get) => {
  return get(connectionStatusAtom) === 'authenticated';
});

/** Is currently reconnecting */
export const isReconnectingAtom = atom((get) => {
  return get(connectionStatusAtom) === 'reconnecting';
});

/** Connection is in a healthy state */
export const isConnectionHealthyAtom = atom((get) => {
  const status = get(connectionStatusAtom);
  return status === 'authenticated';
});

/** Connection is in an unhealthy state */
export const isConnectionUnhealthyAtom = atom((get) => {
  const status = get(connectionStatusAtom);
  return status === 'disconnected' || status === 'reconnecting';
});
