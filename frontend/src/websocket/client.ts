import { getDefaultStore } from 'jotai';
import {
  connectionStatusAtom,
  reconnectAttemptAtom,
  lastConnectedAtAtom,
  lastErrorAtom,
  sessionTokenAtom,
  pendingRequestsAtom,
  type PendingRequest,
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

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionalClose = false;
    this.store.set(connectionStatusAtom, 'connecting');
    this.store.set(lastErrorAtom, null);

    try {
      this.ws = new WebSocket(WS_URL);
      this.setupEventHandlers();
    } catch (error) {
      this.store.set(lastErrorAtom, 'Failed to create WebSocket connection');
      this.store.set(connectionStatusAtom, 'disconnected');
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;
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
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.store.set(connectionStatusAtom, 'connected');
      this.store.set(lastConnectedAtAtom, Date.now());
      this.store.set(reconnectAttemptAtom, 0);
      this.startHeartbeat();
      this.attemptAutoReauth();
    };

    this.ws.onclose = () => {
      this.cleanup();
      if (!this.isIntentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.store.set(lastErrorAtom, 'WebSocket error occurred');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  // ============================================================================
  // Reconnection Strategy
  // ============================================================================

  private scheduleReconnect(): void {
    const attempts = this.store.get(reconnectAttemptAtom);

    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
      this.store.set(connectionStatusAtom, 'disconnected');
      this.store.set(lastErrorAtom, 'Max reconnection attempts reached');
      return;
    }

    this.store.set(connectionStatusAtom, 'reconnecting');
    const delay = calculateBackoff(attempts);

    this.reconnectTimer = setTimeout(() => {
      this.store.set(reconnectAttemptAtom, attempts + 1);
      this.connect();
    }, delay);
  }

  private async attemptAutoReauth(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.store.set(authStatusAtom, 'unauthenticated');
      return;
    }

    this.store.set(connectionStatusAtom, 'authenticating');

    try {
      const response = await this.request<{
        user: Record<string, unknown>;
        session: Record<string, unknown>;
        restaurants: Array<Record<string, unknown>>;
      }>('auth', 'authenticate', { sessionToken: token });

      this.store.set(sessionTokenAtom, token);
      this.store.set(connectionStatusAtom, 'authenticated');
      // Auth atoms will be updated by the component that calls authenticate
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      this.store.set(connectionStatusAtom, 'connected');
      this.store.set(authStatusAtom, 'unauthenticated');
    }
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
          const error = new Error(response.error?.message || 'Request failed');
          (error as any).code = response.error?.code;
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
    this.store.set(sessionTokenAtom, null);
    this.store.set(connectionStatusAtom, 'connected');
    this.store.set(authStatusAtom, 'unauthenticated');
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
