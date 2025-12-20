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
  currentUserGlobalFlagsAtom,
} from '@/atoms/authAtoms';
import { currentUserPriorityAtom, rawPermissionsAtom } from '@/atoms/permissionAtoms';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { connectionStatusAtom, sessionTokenAtom } from '@/atoms/websocketAtoms';
import { authService } from '@/services/auth.service';
import { connectWebSocket, disconnectWebSocket } from '@/hooks/useWebSocket';
import type { UserDTO, RestaurantMinimalDTO } from '@/websocket/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthSuccessData {
  user: UserDTO;
  session: { id: string; expiresAt: string };
  restaurants?: RestaurantMinimalDTO[];
}

export function useAuth() {
  const [authStatus, setAuthStatus] = useAtom(authStatusAtom);
  const setUserId = useSetAtom(currentUserIdAtom);
  const setUserName = useSetAtom(currentUserNameAtom);
  const setUserEmail = useSetAtom(currentUserEmailAtom);
  const setUserAvatar = useSetAtom(currentUserAvatarAtom);
  const setSessionExpiry = useSetAtom(sessionExpiryAtom);
  const setLastActivity = useSetAtom(lastActivityAtom);
  const setGlobalFlags = useSetAtom(currentUserGlobalFlagsAtom);
  const setPermissions = useSetAtom(rawPermissionsAtom);
  const setPriority = useSetAtom(currentUserPriorityAtom);
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
    (
      data: AuthSuccessData,
      shouldConnectWebSocket = true,
      preferredWorkspaceId?: string
    ) => {
      const { user, session, restaurants } = data;

      // Update user atoms
      setUserId(user.id);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserAvatar(user.avatarUrl);
      setGlobalFlags(BigInt(user.globalFlags));
      setAuthStatus('authenticated');

      // Update session atoms
      setSessionExpiry(new Date(session.expiresAt).getTime());
      setLastActivity(Date.now());
      setSessionToken(session.id);

      // Store token in localStorage
      localStorage.setItem('auth_token', session.id);

      // Set current workspace (preferred one from URL or first available)
      if (restaurants && restaurants.length > 0) {
        const targetWorkspace = preferredWorkspaceId
          ? restaurants.find((r) => r.id === preferredWorkspaceId) || restaurants[0]
          : restaurants[0];

        setCurrentWorkspace({
          id: targetWorkspace.id,
          name: targetWorkspace.name,
          slug: targetWorkspace.slug,
          logoUrl: targetWorkspace.logoUrl,
          permissions: BigInt(targetWorkspace.accessFlags),
        });
        setPermissions(BigInt(targetWorkspace.accessFlags));
        setPriority((targetWorkspace as any).rolePriority || 0);
      }

      // Connect WebSocket with the session token
      if (shouldConnectWebSocket) {
        connectWebSocket(session.id);
      }
    },
    [
      setUserId,
      setUserName,
      setUserEmail,
      setUserAvatar,
      setGlobalFlags,
      setAuthStatus,
      setSessionExpiry,
      setLastActivity,
      setSessionToken,
      setCurrentWorkspace,
      setPermissions,
      setPriority,
    ]
  );

  /**
   * Login with email and password via REST API
   * Returns the first workspace ID for navigation on success
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ workspaceId: string } | null> => {
      try {
        const response = await authService.login(credentials);

        handleAuthSuccess({
          user: response.data.user,
          session: {
            id: response.data.session.id,
            expiresAt: response.data.session.expiresAt,
          },
          restaurants: response.data.restaurants,
        });

        // Return first workspace ID for navigation
        const firstWorkspace = response.data.restaurants?.[0];
        return firstWorkspace ? { workspaceId: firstWorkspace.id } : null;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [handleAuthSuccess]
  );

  /**
   * Register new account via REST API
   */
  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<boolean> => {
      try {
        const response = await authService.register(credentials);

        handleAuthSuccess({
          user: response.data.user,
          session: {
            id: response.data.session.id,
            expiresAt: response.data.session.expiresAt,
          },
          restaurants: response.data.restaurants,
        });

        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    [handleAuthSuccess]
  );

  /**
   * Logout current session via REST API
   */
  const logout = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');

    // Disconnect WebSocket first
    disconnectWebSocket();

    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        // Continue with local logout even if server request fails
        console.error('Logout request failed:', error);
      }
    }

    // Clear all auth state
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setUserAvatar(null);
    setGlobalFlags(0n);
    setAuthStatus('unauthenticated');
    setPermissions(0n);
    setCurrentWorkspace(null);
    setSessionExpiry(null);
    setSessionToken(null);
    setConnectionStatus('disconnected');

    localStorage.removeItem('auth_token');
  }, [
    setUserId,
    setUserName,
    setUserEmail,
    setUserAvatar,
      setGlobalFlags,
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
