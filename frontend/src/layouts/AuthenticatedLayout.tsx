import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HamburgerButton } from './HamburgerButton';
import { cn } from '@/utils/cn';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useClock } from '@/pages/Shifts/hooks/useClock';

interface AuthenticatedLayoutProps {
  children?: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const { workspaceId } = useParams();
  const { loadWorkspaces } = useWorkspaces();

  // Initialize clock status if in a workspace
  useClock(workspaceId || '');

  // Load workspaces on initial mount and when workspaceId in URL changes
  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces, workspaceId]);

  // Sync dark class with document for components that still use native dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-350 ease-apple',
      isDark ? 'bg-apple-gray-950 text-white' : 'bg-apple-gray-200 text-black'
    )}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />

          <main className={cn(
            'flex-1 overflow-y-auto p-4',
            'min-[480px]:p-6',
            'min-[1024px]:p-8',
            'transition-colors duration-350 ease-apple',
            isDark ? 'bg-[#1C1C1E]' : 'bg-apple-gray-200'
          )}>
            <div className="max-w-[1600px] mx-auto">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>

      <HamburgerButton />
    </div>
  );
}
