import { getDefaultStore } from 'jotai';
import {
  connectionStatusAtom,
  reconnectAttemptAtom,
  lastConnectedAtAtom,
  lastErrorAtom,
  sessionTokenAtom,
  pendingRequestsAtom,
} from '@/atoms/websocketAtoms';
import { authStatusAtom } from '@/atoms/authAtoms';
import type {
  WSRequest,
  WSResponse,
  WSEvent,
  WSMessageCategory,
} from './types';
import { calculateBackoff, MAX_RECONNECT_ATTEMPTS } from './reconnection';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 25000; // 25 seconds

type MessageHandler = (message: WSEvent<unknown>) => void;
type PushHandler<T = unknown> = (event: string, payload: T) => void;

/**
 * WebSocket Client Singleton
 * Handles connection, reconnection, authentication, and message routing
 *
 * IMPORTANT: WebSocket should only connect AFTER successful REST authentication.
 * Call connect(token) with the session token from the REST login response.
 */
class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private store = getDefaultStore();
  private messageHandlers: Set<MessageHandler> = new Set();
  private pushHandlers: Map<string, Set<PushHandler>> = new Map();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose = false;
  private authToken: string | null = null;

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  /**
   * Connect to WebSocket server with authentication token
   * @param token - Session token from REST login (required for new connections)
   */
  connect(token?: string): void {
    console.log('[WS DEBUG] connect() called', { 
      hasTokenArg: !!token, 
      readyState: this.ws?.readyState 
    });

    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      console.log('[WS DEBUG] Connection already in progress or open, skipping');
      return;
    }

    // Use provided token or fall back to stored token (for reconnection)
    const sessionToken = token || this.authToken || localStorage.getItem('auth_token');

    if (!sessionToken) {
      console.warn('[WS DEBUG] No session token available for connection');
      this.store.set(lastErrorAtom, 'Cannot connect: No authentication token');
      this.store.set(connectionStatusAtom, 'disconnected');
      return;
    }

    this.authToken = sessionToken;
    this.isIntentionalClose = false;
    this.store.set(connectionStatusAtom, 'connecting');
    this.store.set(lastErrorAtom, null);

    try {
      // Include token in WebSocket URL for server-side authentication
      const wsUrl = `${WS_URL}?token=${encodeURIComponent(sessionToken)}`;
      console.log('[WS DEBUG] Initializing WebSocket with URL:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WS DEBUG] Error creating WebSocket:', error);
      this.store.set(lastErrorAtom, 'Failed to create WebSocket connection');
      this.store.set(connectionStatusAtom, 'disconnected');
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.authToken = null;
    this.cleanup();
    this.store.set(connectionStatusAtom, 'disconnected');
    this.store.set(reconnectAttemptAtom, 0);
  }

  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // Reject all pending requests
    const pending = this.store.get(pendingRequestsAtom);
    pending.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error('Connection closed'));
    });
    this.store.set(pendingRequestsAtom, new Map());
  }

  private setupEventHandlers(): void {
    const ws = this.ws;
    if (!ws) return;

    ws.onopen = () => {
      // Only proceed if this is still the current WebSocket
      if (this.ws !== ws) {
        console.log('[WS DEBUG] stale onopen event ignored');
        return;
      }

      console.log('[WS DEBUG] WebSocket connected');
      this.store.set(connectionStatusAtom, 'connected');
      this.store.set(lastConnectedAtAtom, Date.now());
      this.store.set(reconnectAttemptAtom, 0);
      this.startHeartbeat();

      // Authenticate over WebSocket after connection
      this.authenticateSession();
    };

    ws.onclose = () => {
      // If this is still the current WebSocket, clean up state
      if (this.ws === ws) {
        console.log('[WS DEBUG] WebSocket connection closed');
        this.cleanup();
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      } else {
        console.log('[WS DEBUG] stale onclose event ignored');
      }
    };

    ws.onerror = () => {
      if (this.ws !== ws) return;
      console.error('[WS DEBUG] WebSocket error');
      this.store.set(lastErrorAtom, 'WebSocket error occurred');
    };

    ws.onmessage = (event) => {
      if (this.ws !== ws) return;
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error, event.data);
      }
    };
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  private async authenticateSession(): Promise<void> {
    if (!this.authToken) {
      console.warn('[WS DEBUG] No auth token for authenticateSession');
      this.store.set(connectionStatusAtom, 'connected');
      return;
    }

    console.log('[WS DEBUG] authenticating session...');
    this.store.set(connectionStatusAtom, 'authenticating');

    try {
      console.log('[WS DEBUG] Sending auth.authenticate request...');
      await this.request('auth', 'authenticate', { sessionToken: this.authToken });

      console.log('[WS DEBUG] auth.authenticate success');
      this.store.set(sessionTokenAtom, this.authToken);
      this.store.set(connectionStatusAtom, 'authenticated');
    } catch (error) {
      // Token is invalid - disconnect and clear auth
      console.error('[WS DEBUG] WebSocket authentication failed:', error);
      this.store.set(connectionStatusAtom, 'connected');
      this.store.set(lastErrorAtom, 'Authentication failed');
      // Don't clear localStorage here - the REST auth check should handle that
    }
  }

  // ============================================================================
  // Reconnection Strategy
  // ============================================================================

  private scheduleReconnect(): void {
    const attempts = this.store.get(reconnectAttemptAtom);

    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WS DEBUG] Max reconnect attempts reached');
      this.store.set(connectionStatusAtom, 'disconnected');
      this.store.set(lastErrorAtom, 'Max reconnection attempts reached');
      return;
    }

    // Only reconnect if we have a token
    if (!this.authToken && !localStorage.getItem('auth_token')) {
      console.log('[WS DEBUG] Skipping reconnect: no token');
      this.store.set(connectionStatusAtom, 'disconnected');
      return;
    }

    this.store.set(connectionStatusAtom, 'reconnecting');
    const delay = calculateBackoff(attempts);
    console.log(`[WS DEBUG] Scheduling reconnect in ${delay}ms (attempt ${attempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.store.set(reconnectAttemptAtom, attempts + 1);
      this.connect();
    }, delay);
  }

  // ============================================================================
  // Heartbeat
  // ============================================================================

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({
        id: this.generateId(),
        type: 'request',
        category: 'system',
        action: 'ping',
        payload: { clientTime: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
    }, HEARTBEAT_INTERVAL);
  }

  // ============================================================================
  // Message Sending
  // ============================================================================

  private send(message: WSRequest): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  request<T>(
    category: WSMessageCategory,
    action: string,
    payload: unknown = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();

      const timeout = setTimeout(() => {
        const pending = this.store.get(pendingRequestsAtom);
        if (pending.has(id)) {
          console.warn(`[WS DEBUG] Request ${id} timed out`);
          const newPending = new Map(pending);
          newPending.delete(id);
          this.store.set(pendingRequestsAtom, newPending);
          reject(new Error('Request timeout'));
        }
      }, REQUEST_TIMEOUT);

      const pending = this.store.get(pendingRequestsAtom);
      const newPending = new Map(pending);
      newPending.set(id, {
        resolve: resolve as (data: unknown) => void,
        reject,
        timeout,
        sentAt: Date.now(),
      });
      this.store.set(pendingRequestsAtom, newPending);

      try {
        this.send({
          id,
          type: 'request',
          category,
          action,
          payload,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const p = this.store.get(pendingRequestsAtom);
        const np = new Map(p);
        np.delete(id);
        this.store.set(pendingRequestsAtom, np);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // ============================================================================
  // Message Handling
  // ============================================================================

  private handleMessage(message: WSResponse | WSEvent<unknown>): void {
    console.log('[WS DEBUG] handleMessage:', message);
    // Handle response correlation
    if (message.type === 'response' || message.type === 'error') {
      const response = message as WSResponse;
      const pending = this.store.get(pendingRequestsAtom);
      const request = pending.get(response.requestId);

      if (request) {
        clearTimeout(request.timeout);
        const newPending = new Map(pending);
        newPending.delete(response.requestId);
        this.store.set(pendingRequestsAtom, newPending);

        if (response.success) {
          request.resolve(response.data);
        } else {
          const error = new Error(response.error?.message || 'Request failed') as Error & { code?: string };
          error.code = response.error?.code;
          request.reject(error);
        }
        return;
      }
    }

    // Handle server push events
    if (message.type === 'event') {
      const event = message as WSEvent<unknown>;

      // Handle auth events
      if (event.category === 'auth' && event.event === 'session-expired') {
        this.handleSessionExpired();
        return;
      }

      // Notify push handlers
      const channel = `${event.category}.${event.event}`;
      const handlers = this.pushHandlers.get(channel);
      handlers?.forEach((handler) => handler(event.event, event.payload));

      // Notify general handlers
      this.messageHandlers.forEach((handler) => handler(event));
    }
  }

  private handleSessionExpired(): void {
    localStorage.removeItem('auth_token');
    this.authToken = null;
    this.store.set(sessionTokenAtom, null);
    this.store.set(connectionStatusAtom, 'disconnected');
    this.store.set(authStatusAtom, 'unauthenticated');
    this.disconnect();
  }

  // ============================================================================
  // Event Subscriptions
  // ============================================================================

  subscribe<T>(channel: string, handler: PushHandler<T>): () => void {
    if (!this.pushHandlers.has(channel)) {
      this.pushHandlers.set(channel, new Set());
    }

    const handlers = this.pushHandlers.get(channel)!;
    handlers.add(handler as PushHandler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as PushHandler);
      if (handlers.size === 0) {
        this.pushHandlers.delete(channel);
      }
    };
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // ============================================================================
  // Status
  // ============================================================================

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionStatus() {
    return this.store.get(connectionStatusAtom);
  }
}

// Export singleton instance
export const wsClient = WebSocketClient.getInstance();
