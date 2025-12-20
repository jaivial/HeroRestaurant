import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import { useSidebar } from './hooks/useSidebar';
import type { NavItem } from './types';

export function Sidebar() {
  const theme = useAtomValue(themeAtom);
  const {
    sidebarOpen,
    isMobile,
    workspaceName,
    workspaceSlug,
    isRoot,
    filteredNavItems,
    internalNavItems,
    internalOpen,
    toggleSidebar,
    handleNavigation,
    isActive,
    setInternalOpen,
  } = useSidebar();

  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border-white/[0.18]';

  const shadowClass = isDark
    ? 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40',
            'bg-black/40 backdrop-blur-sm',
            'animate-fade-in'
          )}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-[280px] h-screen flex flex-col',
          'border-r transition-all duration-300',
          glassClasses,
          shadowClass,
          isMobile ? 'fixed z-50 animate-slide-in-left' : 'relative'
        )}
      >
        {/* Header */}
        <div className={cn(
          'p-5 border-b',
          isDark ? 'border-white/10' : 'border-black/5'
        )}>
          <div className="flex items-center justify-between mb-1">
            <h2 className={cn(
              'text-lg font-semibold truncate',
              isDark ? 'text-white' : 'text-black'
            )}>
              {workspaceName}
            </h2>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className={cn(
                  'p-1.5 -mr-1',
                  'rounded-[1rem]',
                  isDark 
                    ? 'text-white/60 hover:text-white hover:bg-white/10' 
                    : 'text-black/60 hover:text-black hover:bg-black/5',
                  'transition-colors duration-150'
                )}
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className={cn(
            'text-sm truncate',
            isDark ? 'text-white/40' : 'text-black/40'
          )}>
            {workspaceSlug}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                active={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                isDark={isDark}
              />
            ))}

            {/* Root User Section (Accordion) */}
            {isRoot && (
              <li className={cn(
                'pt-4 mt-4 border-t',
                isDark ? 'border-white/10' : 'border-black/5'
              )}>
                <button
                  onClick={() => setInternalOpen(!internalOpen)}
                  className={cn(
                    'w-full flex items-center justify-between',
                    'px-4 py-2 rounded-[1rem]',
                    'text-xs font-semibold uppercase tracking-wider',
                    isDark ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60',
                    'transition-colors duration-200'
                  )}
                >
                  <span>System Administration</span>
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform duration-300',
                      internalOpen ? 'rotate-180' : ''
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    internalOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  )}
                >
                  <ul className="space-y-1 pl-2">
                    {internalNavItems.map((item) => (
                      <SidebarNavItem
                        key={item.path}
                        item={item}
                        active={isActive(item.path)}
                        onClick={() => handleNavigation(item.path)}
                        isDark={isDark}
                        isSmall
                      />
                    ))}
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t',
          isDark ? 'border-white/10' : 'border-black/5'
        )}>
          <p className={cn(
            'text-xs text-center',
            isDark ? 'text-white/20' : 'text-black/20'
          )}>
            HeroRestaurant v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
  isSmall?: boolean;
}

const SidebarNavItem = memo(function SidebarNavItem({
  item,
  active,
  onClick,
  isDark,
  isSmall = false,
}: SidebarNavItemProps) {
  const activeClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-white/10 text-white border-white/10 shadow-[0_4px_6px_-1px_rgba(255,255,255,0.05)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-black/5 text-black border-black/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]';

  const inactiveClasses = isDark
    ? 'text-white/60 hover:text-white hover:bg-white/5'
    : 'text-black/60 hover:text-black hover:bg-black/5';

  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3',
          'px-4 py-3 rounded-[1rem]',
          isSmall ? 'text-sm' : 'text-sm font-medium',
          'transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue',
          'border border-transparent',
          active ? activeClasses : inactiveClasses
        )}
      >
        <svg
          className={cn(
            isSmall ? 'w-4 h-4' : 'w-5 h-5',
            'shrink-0'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.5 : 2}
            d={item.icon}
          />
        </svg>
        <span>{item.label}</span>
      </button>
    </li>
  );
});
