import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAtomValue } from 'jotai';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';

/**
 * GuestGuard prevents authenticated users from accessing public-only pages
 * (like login or signup) and redirects them to their dashboard.
 */
export function GuestGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const workspace = useAtomValue(currentWorkspaceAtom);

  // While checking auth status, don't redirect or show anything
  if (isLoading) {
    return null;
  }

  // If already authenticated and has a workspace, redirect to dashboard
  if (isAuthenticated && workspace) {
    return <Navigate to={`/w/${workspace.id}/dashboard`} replace />;
  }

  // Otherwise, allow access to the guest page
  return <Outlet />;
}

