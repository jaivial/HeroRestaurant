import type { ServerWebSocket } from 'bun';
import type { ConnectionData, WSEvent } from '../../types/websocket.types';

export type WSConnection = ServerWebSocket<ConnectionData>;

/**
 * In-memory connection state manager
 * Tracks all active WebSocket connections and provides utilities for:
 * - Connection registration/unregistration
 * - User/session authentication state
 * - Broadcasting to users/restaurants
 * - Subscription management
 */
class ConnectionManager {
  // connectionId -> WebSocket instance
  private connections = new Map<string, WSConnection>();

  // userId -> Set<connectionId> (users can have multiple connections)
  private userConnections = new Map<string, Set<string>>();

  // sessionId -> connectionId (one session per connection)
  private sessionConnections = new Map<string, string>();

  // userId -> timestamp (when they first connected in this session)
  private userConnectedAt = new Map<string, Date>();

  // ============================================================================
  // Connection Lifecycle
  // ============================================================================

  /**
   * Register a new WebSocket connection
   */
  register(ws: WSConnection): void {
    const { connectionId } = ws.data;
    this.connections.set(connectionId, ws);
    console.log(`[WS] Connection registered: ${connectionId}`);
  }

  /**
   * Unregister a WebSocket connection (on close)
   */
  unregister(connectionId: string): void {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    const { userId, sessionId } = ws.data;

    // Remove from user connections
    if (userId) {
      const userConns = this.userConnections.get(userId);
      if (userConns) {
        userConns.delete(connectionId);
        if (userConns.size === 0) {
          this.userConnections.delete(userId);
          this.userConnectedAt.delete(userId);
        }
      }
    }

    // Remove from session connections
    if (sessionId) {
      this.sessionConnections.delete(sessionId);
    }

    // Remove connection
    this.connections.delete(connectionId);
    console.log(`[WS] Connection unregistered: ${connectionId}`);
  }

  // ============================================================================
  // Authentication State
  // ============================================================================

  /**
   * Mark a connection as authenticated
   */
  authenticate(
    connectionId: string,
    userId: string,
    sessionId: string,
    globalFlags: bigint
  ): void {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    // Update connection data
    ws.data.userId = userId;
    ws.data.sessionId = sessionId;
    ws.data.globalFlags = globalFlags;

    // Track user connection
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
      this.userConnectedAt.set(userId, new Date());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Track session connection
    this.sessionConnections.set(sessionId, connectionId);

    console.log(`[WS] Connection authenticated: ${connectionId} (user: ${userId})`);
  }

  /**
   * Remove authentication from a connection (logout)
   */
  deauthenticate(connectionId: string): void {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    const { userId, sessionId } = ws.data;

    // Remove from user connections
    if (userId) {
      const userConns = this.userConnections.get(userId);
      if (userConns) {
        userConns.delete(connectionId);
        if (userConns.size === 0) {
          this.userConnections.delete(userId);
          this.userConnectedAt.delete(userId);
        }
      }
    }

    // Remove from session connections
    if (sessionId) {
      this.sessionConnections.delete(sessionId);
    }

    // Clear connection auth state
    ws.data.userId = null;
    ws.data.sessionId = null;
    ws.data.globalFlags = 0n;
    ws.data.currentRestaurantId = null;

    console.log(`[WS] Connection deauthenticated: ${connectionId}`);
  }

  // ============================================================================
  // Connection Lookups
  // ============================================================================

  /**
   * Get a connection by ID
   */
  getConnection(connectionId: string): WSConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get all connections for a user
   */
  getConnectionsByUserId(userId: string): WSConnection[] {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return [];

    return Array.from(connectionIds)
      .map((id) => this.connections.get(id))
      .filter((ws): ws is WSConnection => ws !== undefined);
  }

  /**
   * Get connection by session ID
   */
  getConnectionBySessionId(sessionId: string): WSConnection | undefined {
    const connectionId = this.sessionConnections.get(sessionId);
    if (!connectionId) return undefined;
    return this.connections.get(connectionId);
  }

  /**
   * Check if a user has any active connections
   */
  isUserConnected(userId: string): boolean {
    const conns = this.userConnections.get(userId);
    return conns !== undefined && conns.size > 0;
  }

  /**
   * Get when a user first connected in the current session
   */
  getUserConnectedAt(userId: string): Date | undefined {
    return this.userConnectedAt.get(userId);
  }

  // ============================================================================
  // Restaurant Context
  // ============================================================================

  /**
   * Set the current restaurant context for a connection
   */
  setCurrentRestaurant(connectionId: string, restaurantId: string | null): void {
    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.data.currentRestaurantId = restaurantId;
    }
  }

  // ============================================================================
  // Subscriptions
  // ============================================================================

  /**
   * Subscribe a connection to a channel
   */
  subscribe(connectionId: string, channel: string): void {
    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.data.subscriptions.add(channel);
    }
  }

  /**
   * Unsubscribe a connection from a channel
   */
  unsubscribe(connectionId: string, channel: string): void {
    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.data.subscriptions.delete(channel);
    }
  }

  /**
   * Get all connections subscribed to a channel
   */
  getSubscribers(channel: string): WSConnection[] {
    const subscribers: WSConnection[] = [];
    for (const ws of this.connections.values()) {
      if (ws.data.subscriptions.has(channel)) {
        subscribers.push(ws);
      }
    }
    return subscribers;
  }

  // ============================================================================
  // Broadcasting
  // ============================================================================

  /**
   * Send an event to all connections of a user
   */
  broadcastToUser(userId: string, event: WSEvent<unknown>): void {
    const connections = this.getConnectionsByUserId(userId);
    const message = JSON.stringify(event);
    for (const ws of connections) {
      try {
        ws.send(message);
      } catch (error) {
        console.error(`[WS] Failed to send to ${ws.data.connectionId}:`, error);
      }
    }
  }

  /**
   * Send an event to all subscribers of a channel
   */
  broadcastToChannel(channel: string, event: WSEvent<unknown>): void {
    const subscribers = this.getSubscribers(channel);
    const message = JSON.stringify(event);
    for (const ws of subscribers) {
      try {
        ws.send(message);
      } catch (error) {
        console.error(`[WS] Failed to send to ${ws.data.connectionId}:`, error);
      }
    }
  }

  /**
   * Send an event to all authenticated connections in a restaurant
   */
  broadcastToRestaurant(restaurantId: string, event: WSEvent<unknown>): void {
    const message = JSON.stringify(event);
    for (const ws of this.connections.values()) {
      if (ws.data.currentRestaurantId === restaurantId) {
        try {
          ws.send(message);
        } catch (error) {
          console.error(`[WS] Failed to send to ${ws.data.connectionId}:`, error);
        }
      }
    }
  }

  /**
   * Send an event to all authenticated connections
   */
  broadcastToAll(event: WSEvent<unknown>): void {
    const message = JSON.stringify(event);
    for (const ws of this.connections.values()) {
      if (ws.data.userId) {
        try {
          ws.send(message);
        } catch (error) {
          console.error(`[WS] Failed to send to ${ws.data.connectionId}:`, error);
        }
      }
    }
  }

  // ============================================================================
  // Disconnect Utilities
  // ============================================================================

  /**
   * Disconnect all connections for a user
   */
  disconnectUser(userId: string, reason: string): void {
    const connections = this.getConnectionsByUserId(userId);
    for (const ws of connections) {
      try {
        ws.close(1000, reason);
      } catch (error) {
        console.error(`[WS] Failed to close ${ws.data.connectionId}:`, error);
      }
    }
  }

  /**
   * Disconnect a specific session
   */
  disconnectSession(sessionId: string, reason: string): void {
    const ws = this.getConnectionBySessionId(sessionId);
    if (ws) {
      try {
        ws.close(1000, reason);
      } catch (error) {
        console.error(`[WS] Failed to close ${ws.data.connectionId}:`, error);
      }
    }
  }

  // ============================================================================
  // Stats
  // ============================================================================

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    authenticatedConnections: number;
    uniqueUsers: number;
    activeSessions: number;
  } {
    let authenticatedConnections = 0;
    for (const ws of this.connections.values()) {
      if (ws.data.userId) {
        authenticatedConnections++;
      }
    }

    return {
      totalConnections: this.connections.size,
      authenticatedConnections,
      uniqueUsers: this.userConnections.size,
      activeSessions: this.sessionConnections.size,
    };
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();
