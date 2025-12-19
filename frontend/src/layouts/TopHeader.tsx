import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom, toggleThemeAtom } from '@/atoms/themeAtoms';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar/Avatar';

export function TopHeader() {
  const theme = useAtomValue(themeAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'h-16 flex items-center justify-between px-6',
        'glass border-b border-content-quaternary/10'
      )}
    >
      {/* Logo / Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-content-primary">
          HeroRestaurant
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => toggleTheme()}
          className={cn(
            'p-2.5 rounded-full',
            'text-content-secondary hover:text-content-primary',
            'hover:bg-surface-tertiary',
            'transition-all duration-200 ease-apple',
            'active:scale-95',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue'
          )}
          aria-label="Toggle theme"
        >
          {isDark ? (
            /* Sun icon (shown in dark mode) */
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            /* Moon icon (shown in light mode) */
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* User section */}
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl ?? undefined}
            name={user?.name ?? undefined}
            size="sm"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-content-primary leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-content-tertiary">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className={cn(
            'ml-1 px-3 py-1.5',
            'text-sm font-medium rounded-[0.5rem]',
            'text-apple-red',
            'hover:bg-apple-red/10',
            'transition-colors duration-200 ease-apple',
            'active:scale-[0.98]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-red'
          )}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
