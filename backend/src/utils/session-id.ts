import { env } from '../config/env';

/**
 * Generates a cryptographically secure session ID
 * - 32 bytes (256 bits) of entropy
 * - URL-safe base64 encoding
 */
export function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  // Convert to base64url (URL-safe base64)
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Hashes a session ID for storage
 * Uses SHA-256 with a server secret
 */
export async function hashSessionId(sessionId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sessionId + env.HASH_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hashBuffer).toString('hex');
}
