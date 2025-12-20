import { useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
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
import { sessionTokenAtom } from '@/atoms/websocketAtoms';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

/**
 * Auth initialization hook that checks for existing session via REST API.
 *
 * Flow:
 * 1. Check for stored auth token in localStorage
 * 2. If token exists, validate it via REST API `/auth/me`
 * 3. If valid, update auth state and connect WebSocket
 * 4. If invalid, clear token and set unauthenticated
 */
export function useAuthInit() {
  const initialized = useRef(false);
  const setAuthStatus = useSetAtom(authStatusAtom);
  const { handleAuthSuccess } = useAuth();

  useEffect(() => {
    // Don't initialize twice
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      console.log('[AUTH DEBUG] initAuth starting...');
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.log('[AUTH DEBUG] No token found in localStorage');
        // No stored token - user is not authenticated
        setAuthStatus('unauthenticated');
        return;
      }

      console.log('[AUTH DEBUG] Token found, validating via /auth/me...');
      try {
        // Validate token via REST API
        const response = await authService.me(token);
        console.log('[AUTH DEBUG] /auth/me success');
        const { user, session, restaurants } = response.data;

        // Extract workspace ID from URL if present (/w/:workspaceId/...)
        const workspaceIdFromUrl = window.location.pathname.match(
          /\/w\/([^/]+)/
        )?.[1];

        // Use handleAuthSuccess to set up all atoms and connect WebSocket
        handleAuthSuccess(
          {
            user,
            session: { id: token, expiresAt: session.expiresAt },
            restaurants,
          },
          true,
          workspaceIdFromUrl
        );
      } catch (error) {
        // Token is invalid or expired - clear it
        console.error('Session validation failed:', error);
        localStorage.removeItem('auth_token');
        setAuthStatus('unauthenticated');
      }
    };

    initAuth();
  }, [setAuthStatus, handleAuthSuccess]);
}
