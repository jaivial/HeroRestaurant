import type { ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserGlobalFlagsAtom } from '@/atoms/authAtoms';
import { Navigate } from 'react-router-dom';

interface GlobalFlagGuardProps {
  children: ReactNode;
  requiredFlag: bigint;
  redirectTo?: string;
}

export function GlobalFlagGuard({
  children,
  requiredFlag,
  redirectTo = '/dashboard' // Default redirect is dashboard as requested
}: GlobalFlagGuardProps) {
  const globalFlags = useAtomValue(currentUserGlobalFlagsAtom);

  const hasFlag = (globalFlags & requiredFlag) !== 0n;

  if (!hasFlag) {
    // If user tries to access manually without permission, redirect
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
