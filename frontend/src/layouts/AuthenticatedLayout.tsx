import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HamburgerButton } from './HamburgerButton';
import { cn } from '@/utils/cn';

interface AuthenticatedLayoutProps {
  children?: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

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
      isDark ? 'bg-apple-gray-950 text-white' : 'bg-apple-gray-100 text-black'
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
            isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'
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
