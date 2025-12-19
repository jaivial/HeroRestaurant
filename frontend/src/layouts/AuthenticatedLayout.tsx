import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HamburgerButton } from './HamburgerButton';

interface AuthenticatedLayoutProps {
  children?: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />

          <main className="flex-1 overflow-y-auto p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>

      <HamburgerButton />
    </div>
  );
}
