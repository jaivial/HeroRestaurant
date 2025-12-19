import type { WSConnection } from '../state/connections';
import { SessionService } from '../../services/session.service';

interface SessionError {
  code: string;
  message: string;
}

/**
 * Validate the session attached to a WebSocket connection
 * Returns null if valid, error object if invalid
 */
export async function validateSession(ws: WSConnection): Promise<SessionError | null> {
  const { sessionId } = ws.data;

  // Not authenticated
  if (!sessionId) {
    return {
      code: 'WS_NOT_AUTHENTICATED',
      message: 'Authentication required. Send auth.login or auth.authenticate first.',
    };
  }

  try {
    // Validate and potentially extend session
    const { user, session } = await SessionService.validate(sessionId);

    // Update connection state with fresh data
    ws.data.userId = user.id;
    ws.data.globalFlags = user.global_flags;

    return null; // Session valid
  } catch (error: any) {
    // Session invalid - clear authentication state
    ws.data.sessionId = null;
    ws.data.userId = null;
    ws.data.globalFlags = 0n;
    ws.data.currentRestaurantId = null;

    return {
      code: error.code || 'SESSION_INVALID',
      message: error.message || 'Session validation failed',
    };
  }
}
