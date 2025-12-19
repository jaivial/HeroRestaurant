import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { authStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [authStatus, isAuthenticated, navigate, location.pathname]);

  if (authStatus === 'unknown') {
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
