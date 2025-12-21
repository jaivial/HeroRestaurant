import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom, toggleThemeAtom } from '@/atoms/themeAtoms';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { WorkspaceSwitcher } from '@/components/ui/WorkspaceSwitcher/WorkspaceSwitcher';
import { ActiveShiftClock } from './components/ActiveShiftClock';

export function TopHeader() {
  const theme = useAtomValue(themeAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/85 border-black/[0.08]';

  const shadowClass = isDark
    ? 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.04)]';

  return (
    <header
      className={cn(
        'h-16 flex items-center justify-between px-6',
        'border-b transition-all duration-300',
        glassClasses,
        shadowClass
      )}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-4">
        <h1 className={cn(
          'text-xl font-semibold hidden lg:block',
          isDark ? 'text-white' : 'text-black'
        )}>
          HeroRestaurant
        </h1>
        
        <WorkspaceSwitcher />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ActiveShiftClock />

        {/* Theme toggle */}
        <button
          onClick={() => toggleTheme()}
          className={cn(
            'p-2.5 rounded-[1rem]',
            isDark 
              ? 'text-white/60 hover:text-white hover:bg-white/10' 
              : 'text-black/60 hover:text-black hover:bg-black/5',
            'transition-all duration-200',
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
            <p className={cn(
              'text-sm font-medium leading-tight',
              isDark ? 'text-white' : 'text-black'
            )}>
              {user?.name}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-white/40' : 'text-black/40'
            )}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className={cn(
            'ml-1 px-3 py-1.5',
            'text-sm font-medium rounded-[1rem]',
            'text-[#FF3B30]', // Apple Red
            isDark ? 'hover:bg-[#FF3B30]/20' : 'hover:bg-[#FF3B30]/10',
            'transition-colors duration-200',
            'active:scale-[0.98]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30]'
          )}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
