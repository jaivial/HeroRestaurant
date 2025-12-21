import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card } from '@/components/ui';

interface AclGuardProps {
  children: ReactNode;
  requiredPermissions?: bigint[];
  permissionMode?: 'all' | 'any';
  fallback?: ReactNode;
}

export function AclGuard({
  children,
  requiredPermissions = [],
  permissionMode = 'all',
  fallback,
}: AclGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  const hasAccess =
    permissionMode === 'all'
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this resource.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
