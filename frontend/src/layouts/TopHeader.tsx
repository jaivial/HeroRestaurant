import { useSetAtom } from 'jotai';
import { toggleThemeAtom } from '@/atoms/themeAtoms';
import { useAuth } from '@/hooks/useAuth';

export function TopHeader() {
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const { user, logout } = useAuth();

  return (
    <header className="h-16 glass border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          HeroRestaurant
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleTheme()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-200"
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
        </button>

        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || ''}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="ml-2 px-3 py-1.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
