// ============================================================================
// Reconnection Strategy with Exponential Backoff
// ============================================================================

export const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_DELAY = 1000;  // 1 second
const MAX_DELAY = 30000;  // 30 seconds
const JITTER_FACTOR = 0.3;

/**
 * Calculate reconnection delay with exponential backoff and jitter
 * Prevents thundering herd problem when server restarts
 */
export function calculateBackoff(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
  const exponentialDelay = Math.min(
    BASE_DELAY * Math.pow(2, attempt),
    MAX_DELAY
  );

  // Add random jitter (up to 30% of delay)
  const jitter = exponentialDelay * JITTER_FACTOR * Math.random();

  return Math.floor(exponentialDelay + jitter);
}

/**
 * Get human-readable reconnection status message
 */
export function getReconnectionMessage(attempt: number): string {
  if (attempt === 0) {
    return 'Connecting...';
  }
  if (attempt >= MAX_RECONNECT_ATTEMPTS) {
    return 'Connection failed. Please refresh the page.';
  }
  return `Reconnecting... (attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})`;
}
