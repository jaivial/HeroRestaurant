import type { WSConnection } from '../state/connections';
import type {
  WSRequest,
  WSResponse,
  WSErrorResponse,
  WSMessageCategory,
} from '../../types/websocket.types';
import {
  PUBLIC_ACTIONS,
  actionSchemaMap,
  createErrorResponse,
  createPongResponse,
} from '../../types/websocket.types';
import { validateSession } from '../middleware/session.ws';
import { checkRateLimit } from '../middleware/rate-limit.ws';
import { authHandlers } from './auth.handler';
import { userHandlers } from './user.handler';
import { restaurantHandlers } from './restaurant.handler';
import { memberHandlers } from './member.handler';

// Type for handler functions
type MessageHandler = (
  ws: WSConnection,
  payload: unknown
) => Promise<{ data?: unknown; error?: { code: string; message: string; details?: unknown } }>;

// Handler registry
const handlers: Record<string, MessageHandler> = {
  // Auth handlers
  'auth.register': authHandlers.register,
  'auth.login': authHandlers.login,
  'auth.logout': authHandlers.logout,
  'auth.logout-all': authHandlers.logoutAll,
  'auth.me': authHandlers.me,
  'auth.authenticate': authHandlers.authenticate,

  // Session handlers
  'session.list': authHandlers.sessionList,
  'session.revoke': authHandlers.sessionRevoke,

  // User handlers
  'user.get': userHandlers.get,
  'user.update': userHandlers.update,

  // Restaurant handlers
  'restaurant.create': restaurantHandlers.create,
  'restaurant.list': restaurantHandlers.list,
  'restaurant.get': restaurantHandlers.get,
  'restaurant.update': restaurantHandlers.update,
  'restaurant.delete': restaurantHandlers.delete,

  // Member handlers
  'member.list': memberHandlers.list,
  'member.invite': memberHandlers.invite,
  'member.update': memberHandlers.update,
  'member.remove': memberHandlers.remove,
};

/**
 * Main message router
 */
export async function handleMessage(
  ws: WSConnection,
  request: WSRequest
): Promise<WSResponse> {
  const { id: requestId, category, action, payload } = request;
  const actionKey = `${category}.${action}`;

  // Handle ping/pong
  if (category === 'system' && action === 'ping') {
    const pingPayload = payload as { clientTime: string };
    return createPongResponse(requestId, request.id, pingPayload.clientTime);
  }

  // Rate limiting
  const rateLimitError = checkRateLimit(ws);
  if (rateLimitError) {
    return createErrorResponse(requestId, 'RATE_LIMITED', rateLimitError);
  }

  // Check if handler exists
  const handler = handlers[actionKey];
  if (!handler) {
    return createErrorResponse(
      requestId,
      'UNKNOWN_ACTION',
      `Unknown action: ${actionKey}`
    );
  }

  // Validate payload schema
  const schema = actionSchemaMap[actionKey];
  if (schema) {
    const parseResult = schema.safeParse(payload);
    if (!parseResult.success) {
      return createErrorResponse(
        requestId,
        'VALIDATION_ERROR',
        'Invalid payload',
        { errors: parseResult.error.flatten() }
      );
    }
  }

  // Authentication check for protected actions
  if (!PUBLIC_ACTIONS.has(actionKey)) {
    const authError = await validateSession(ws);
    if (authError) {
      return createErrorResponse(requestId, authError.code, authError.message);
    }
  }

  // Execute handler
  try {
    const result = await handler(ws, payload);

    if (result.error) {
      return createErrorResponse(
        requestId,
        result.error.code as any,
        result.error.message,
        result.error.details
      );
    }

    return {
      id: crypto.randomUUID(),
      type: 'response',
      requestId,
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`[WS] Handler error for ${actionKey}:`, error);

    // Map known errors
    if (error.code) {
      return createErrorResponse(requestId, error.code, error.message);
    }

    return createErrorResponse(
      requestId,
      'INTERNAL_ERROR',
      'An unexpected error occurred'
    );
  }
}
