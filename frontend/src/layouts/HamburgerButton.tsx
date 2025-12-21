import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { toggleSidebarAtom } from '@/atoms/layoutAtoms';
import { useViewport } from '@/hooks/useViewport';
import { cn } from '@/utils/cn';

export function HamburgerButton() {
  const theme = useAtomValue(themeAtom);
  const toggleSidebar = useSetAtom(toggleSidebarAtom);
  const { isMobile } = useViewport();
  const isDark = theme === 'dark';

  if (!isMobile) return null;

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/85 border-black/[0.08]';

  const shadowClass = isDark
    ? 'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]'
    : 'shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]';

  return (
    <button
      onClick={() => toggleSidebar()}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14',
        'rounded-full',
        'flex items-center justify-center',
        'transition-all duration-300',
        glassClasses,
        shadowClass,
        'hover:scale-110',
        'active:scale-90',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2'
      )}
      aria-label="Toggle menu"
    >
      <svg
        className={cn(
          'w-6 h-6',
          isDark ? 'text-white' : 'text-black'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
