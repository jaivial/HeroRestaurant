import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  authStatusAtom,
  currentUserIdAtom,
  currentUserNameAtom,
  currentUserEmailAtom,
  currentUserAvatarAtom,
  sessionExpiryAtom,
  lastActivityAtom,
} from '@/atoms/authAtoms';
import { rawPermissionsAtom } from '@/atoms/permissionAtoms';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { connectionStatusAtom, sessionTokenAtom } from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';
import type { LoginResponseData, AuthenticateResponseData } from '@/websocket';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const [authStatus, setAuthStatus] = useAtom(authStatusAtom);
  const setUserId = useSetAtom(currentUserIdAtom);
  const setUserName = useSetAtom(currentUserNameAtom);
  const setUserEmail = useSetAtom(currentUserEmailAtom);
  const setUserAvatar = useSetAtom(currentUserAvatarAtom);
  const setSessionExpiry = useSetAtom(sessionExpiryAtom);
  const setLastActivity = useSetAtom(lastActivityAtom);
  const setPermissions = useSetAtom(rawPermissionsAtom);
  const setCurrentWorkspace = useSetAtom(currentWorkspaceAtom);
  const setConnectionStatus = useSetAtom(connectionStatusAtom);
  const setSessionToken = useSetAtom(sessionTokenAtom);

  const userId = useAtomValue(currentUserIdAtom);
  const userName = useAtomValue(currentUserNameAtom);
  const userEmail = useAtomValue(currentUserEmailAtom);
  const userAvatar = useAtomValue(currentUserAvatarAtom);

  /**
   * Handle successful authentication response
   */
  const handleAuthSuccess = useCallback(
    (response: LoginResponseData | AuthenticateResponseData, token: string) => {
      const { user, restaurants } = response;

      // Update user atoms
      setUserId(user.id);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserAvatar(user.avatarUrl);
      setAuthStatus('authenticated');

      // Update session atoms
      const expiresAt = 'expiresAt' in response.session
        ? response.session.expiresAt
        : (response.session as any).expiresAt;
      setSessionExpiry(new Date(expiresAt).getTime());
      setLastActivity(Date.now());
      setSessionToken(token);
      setConnectionStatus('authenticated');

      // Store token
      localStorage.setItem('auth_token', token);

      // Set first workspace as current (if available)
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
    },
    [
      setUserId,
      setUserName,
      setUserEmail,
      setUserAvatar,
      setAuthStatus,
      setSessionExpiry,
      setLastActivity,
      setSessionToken,
      setConnectionStatus,
      setCurrentWorkspace,
      setPermissions,
    ]
  );

  /**
   * Login with email and password via WebSocket
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        const response = await wsClient.request<LoginResponseData>('auth', 'login', credentials);

        // Get the session token from the response
        const token = response.session.id;
        handleAuthSuccess(response, token);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [handleAuthSuccess]
  );

  /**
   * Register new account via WebSocket
   */
  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<boolean> => {
      try {
        const response = await wsClient.request<LoginResponseData>('auth', 'register', credentials);

        // Get the session token from the response
        const token = response.session.id;
        handleAuthSuccess(response, token);
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        return false;
      }
    },
    [handleAuthSuccess]
  );

  /**
   * Logout current session via WebSocket
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await wsClient.request('auth', 'logout', {});
    } catch (error) {
      // Continue with local logout even if server request fails
      console.error('Logout request failed:', error);
    }

    // Clear all auth state
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setUserAvatar(null);
    setAuthStatus('unauthenticated');
    setPermissions(0n);
    setCurrentWorkspace(null);
    setSessionExpiry(null);
    setSessionToken(null);
    setConnectionStatus('connected');

    localStorage.removeItem('auth_token');
  }, [
    setUserId,
    setUserName,
    setUserEmail,
    setUserAvatar,
    setAuthStatus,
    setPermissions,
    setCurrentWorkspace,
    setSessionExpiry,
    setSessionToken,
    setConnectionStatus,
  ]);

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, [setLastActivity]);

  return {
    authStatus,
    isAuthenticated: authStatus === 'authenticated',
    isUnauthenticated: authStatus === 'unauthenticated',
    isLoading: authStatus === 'unknown',
    user: userId
      ? { id: userId, name: userName, email: userEmail, avatarUrl: userAvatar }
      : null,
    login,
    register,
    logout,
    updateActivity,
    handleAuthSuccess,
  };
}
