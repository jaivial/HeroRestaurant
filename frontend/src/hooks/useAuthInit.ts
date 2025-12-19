import { useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { connectionStatusAtom } from '@/atoms/websocketAtoms';
import { authStatusAtom } from '@/atoms/authAtoms';
import {
  currentUserIdAtom,
  currentUserNameAtom,
  currentUserEmailAtom,
  currentUserAvatarAtom,
  sessionExpiryAtom,
} from '@/atoms/authAtoms';
import { rawPermissionsAtom } from '@/atoms/permissionAtoms';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { wsClient } from '@/websocket';
import type { AuthenticateResponseData } from '@/websocket';

/**
 * Auth initialization is now handled by the WebSocket client's
 * attemptAutoReauth() method when connection is established.
 *
 * This hook monitors the connection status and handles the
 * authentication response data to update the auth atoms.
 */
export function useAuthInit() {
  const initialized = useRef(false);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const setAuthStatus = useSetAtom(authStatusAtom);
  const setUserId = useSetAtom(currentUserIdAtom);
  const setUserName = useSetAtom(currentUserNameAtom);
  const setUserEmail = useSetAtom(currentUserEmailAtom);
  const setUserAvatar = useSetAtom(currentUserAvatarAtom);
  const setSessionExpiry = useSetAtom(sessionExpiryAtom);
  const setPermissions = useSetAtom(rawPermissionsAtom);
  const setCurrentWorkspace = useSetAtom(currentWorkspaceAtom);

  useEffect(() => {
    // Don't initialize if already done
    if (initialized.current) return;

    // Wait for WebSocket to connect
    if (connectionStatus === 'disconnected' || connectionStatus === 'connecting') {
      return;
    }

    // If authenticated, the WebSocket client already called attemptAutoReauth
    // and the auth state should be updated via the wsClient
    if (connectionStatus === 'authenticated') {
      initialized.current = true;
      // Auth atoms were updated by handleAuthSuccess in useAuth
      return;
    }

    // If connected but not authenticated, we need to restore the session
    if (connectionStatus === 'connected') {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setAuthStatus('unauthenticated');
        initialized.current = true;
        return;
      }

      // Try to authenticate with the stored token
      wsClient
        .request<AuthenticateResponseData>('auth', 'authenticate', { sessionToken: token })
        .then((response) => {
          const { user, session, restaurants } = response;

          setUserId(user.id);
          setUserName(user.name);
          setUserEmail(user.email);
          setUserAvatar(user.avatarUrl);
          setSessionExpiry(new Date(session.expiresAt).getTime());
          setAuthStatus('authenticated');

          // Set first workspace as current
          if (restaurants && restaurants.length > 0) {
            const firstWorkspace = restaurants[0];
            setCurrentWorkspace({
              id: firstWorkspace.id,
              name: firstWorkspace.name,
              slug: firstWorkspace.slug,
              logoUrl: firstWorkspace.logoUrl,
              permissions: BigInt(firstWorkspace.accessFlags),
            });
            setPermissions(BigInt(firstWorkspace.accessFlags));
          }

          initialized.current = true;
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          setAuthStatus('unauthenticated');
          initialized.current = true;
        });
    }
  }, [
    connectionStatus,
    setAuthStatus,
    setUserId,
    setUserName,
    setUserEmail,
    setUserAvatar,
    setSessionExpiry,
    setPermissions,
    setCurrentWorkspace,
  ]);
}
