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
import type { User, Workspace } from '@/types';

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

  const userId = useAtomValue(currentUserIdAtom);
  const userName = useAtomValue(currentUserNameAtom);
  const userEmail = useAtomValue(currentUserEmailAtom);
  const userAvatar = useAtomValue(currentUserAvatarAtom);

  const login = (user: User, workspace: Workspace, token: string) => {
    setUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserAvatar(user.avatar || null);
    setAuthStatus('authenticated');
    setPermissions(workspace.permissions);
    setCurrentWorkspace(workspace);

    // Set session expiry (e.g., 24 hours from now)
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    setSessionExpiry(expiry);
    setLastActivity(Date.now());

    // Store token in localStorage
    localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setUserAvatar(null);
    setAuthStatus('unauthenticated');
    setPermissions(0n);
    setCurrentWorkspace(null);
    setSessionExpiry(null);

    // Clear token from localStorage
    localStorage.removeItem('auth_token');
  };

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  return {
    authStatus,
    isAuthenticated: authStatus === 'authenticated',
    isUnauthenticated: authStatus === 'unauthenticated',
    isLoading: authStatus === 'unknown',
    user: userId
      ? { id: userId, name: userName, email: userEmail, avatar: userAvatar }
      : null,
    login,
    logout,
    updateActivity,
  };
}
