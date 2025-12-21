import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { authStatusAtom } from '@/atoms/authAtoms';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { authStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuthStatus = useSetAtom(authStatusAtom);
  const [isValidating, setIsValidating] = useState(true);

  /**
   * Validate session by calling auth/me endpoint
   * This runs before rendering any protected route
   */
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.log('[AuthGuard] No session token found - redirecting to login');
      setAuthStatus('unauthenticated');
      setIsValidating(false);
      return;
    }

    try {
      const response = await authService.me(token);
      console.log('[AuthGuard] auth/me response:', response);

      // Check if session is expired
      const expiresAt = new Date(response.data.session.expiresAt).getTime();
      const now = Date.now();

      if (expiresAt <= now) {
        console.log('[AuthGuard] Session expired - redirecting to login');
        localStorage.removeItem('auth_token');
        setAuthStatus('unauthenticated');
        setIsValidating(false);
        return;
      }

      // Session is valid
      console.log('[AuthGuard] Session valid, expires at:', new Date(expiresAt).toISOString());
      setIsValidating(false);
    } catch (error) {
      console.log('[AuthGuard] Session validation failed:', error);
      // Token is invalid or expired - clear it and redirect
      localStorage.removeItem('auth_token');
      setAuthStatus('unauthenticated');
      setIsValidating(false);
    }
  }, [setAuthStatus]);

  // Validate session on mount and when location changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsValidating(true);
    validateSession();
  }, [validateSession, location.pathname]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isValidating && authStatus === 'unauthenticated') {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [authStatus, isValidating, navigate, location.pathname]);

  // Show loading while validating session
  if (isValidating || authStatus === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
