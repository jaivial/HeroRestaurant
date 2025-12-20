import { Elysia } from 'elysia';
import type { ConnectionData, WSRequest } from '../types/websocket.types';
import { wsRequestSchema, WS_MAX_PAYLOAD_SIZE } from '../types/websocket.types';
import { connectionManager } from './state/connections';
import { handleMessage } from './handlers';

// Store connection data separately since Elysia doesn't allow modifying ws.data
const connectionDataStore = new Map<string, ConnectionData>();

export function getConnectionData(connectionId: string): ConnectionData | undefined {
  return connectionDataStore.get(connectionId);
}

export function setConnectionData(connectionId: string, data: ConnectionData): void {
  connectionDataStore.set(connectionId, data);
}

export function deleteConnectionData(connectionId: string): void {
  connectionDataStore.delete(connectionId);
}

/**
 * Creates the WebSocket server plugin for Elysia
 */
export const createWebSocketServer = () => {
  return new Elysia()
    .ws('/ws', {
      maxPayloadLength: WS_MAX_PAYLOAD_SIZE,
      // Connection opened
      open(ws) {
        console.log(`[WS DEBUG] Connection opening: ${ws.id}`);
        // Use ws.id as the stable connection identifier
        const connectionId = ws.id;

        // Initialize connection data
        const connectionData: ConnectionData = {
          connectionId,
          connectedAt: new Date(),
          ipAddress: null,
          userAgent: null,
          sessionId: null,
          userId: null,
          globalFlags: 0n,
          currentRestaurantId: null,
          subscriptions: new Set(),
          messageCount: 0,
          windowStart: Date.now(),
          lastPingAt: null,
        };

        // Store connection data
        setConnectionData(connectionId, connectionData);

        // Create a wrapped WebSocket with our connection data
        const wrappedWs = {
          ...ws,
          data: connectionData,
          send: (message: string) => ws.send(message),
          close: (code?: number, reason?: string) => ws.close(),
        };

        connectionManager.register(wrappedWs as any);
        console.log(`[WS] New connection: ${connectionId}`);
      },

      // Message received
      async message(ws, rawMessage) {
        const connectionId = ws.id;
        console.log(`[WS DEBUG] Message received on ${connectionId}:`, String(rawMessage).substring(0, 100));
        const connectionData = getConnectionData(connectionId);

        if (!connectionData) {
          console.error('[WS] No connection data found for:', connectionId);
          return;
        }

        try {
          // Parse and validate the message
          let message;
          if (typeof rawMessage === 'string') {
            message = JSON.parse(rawMessage);
          } else if (rawMessage instanceof Buffer || rawMessage instanceof Uint8Array) {
            message = JSON.parse(new TextDecoder().decode(rawMessage));
          } else {
            message = rawMessage;
          }

          const parseResult = wsRequestSchema.safeParse(message);

          if (!parseResult.success) {
            console.error('[WS] Validation error:', JSON.stringify(parseResult.error.format()), 'Message:', JSON.stringify(message).substring(0, 200));
            ws.send(JSON.stringify({
              id: crypto.randomUUID(),
              type: 'error',
              requestId: (message as WSRequest)?.id || 'unknown',
              success: false,
              error: {
                code: 'INVALID_MESSAGE_FORMAT',
                message: 'Invalid message format',
                details: parseResult.error.flatten(),
              },
              timestamp: new Date().toISOString(),
            }));
            return;
          }

          const request = parseResult.data as WSRequest;

          // Create wrapped ws with connection data
          const wrappedWs = {
            ...ws,
            data: connectionData,
            send: (message: string) => ws.send(message),
            close: (code?: number, reason?: string) => ws.close(),
          };

          // Handle the message
          const response = await handleMessage(wrappedWs as any, request);

          // Update stored connection data (in case it was modified)
          setConnectionData(connectionId, connectionData);

          // Send response
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('[WS] Message handling error:', error);

          const requestId = typeof rawMessage === 'object' && rawMessage !== null
            ? (rawMessage as WSRequest).id || 'unknown'
            : 'unknown';

          ws.send(JSON.stringify({
            id: crypto.randomUUID(),
            type: 'error',
            requestId,
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'An unexpected error occurred',
            },
            timestamp: new Date().toISOString(),
          }));
        }
      },

      // Connection closed
      close(ws) {
        const connectionId = ws.id;
        const connectionData = getConnectionData(connectionId);
        if (connectionData) {
          connectionManager.unregister(connectionId);
        }
        deleteConnectionData(connectionId);
        console.log(`[WS] Connection closed: ${connectionId}`);
      },
    });
};
