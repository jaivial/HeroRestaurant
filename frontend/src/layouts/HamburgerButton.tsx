import { useSetAtom } from 'jotai';
import { toggleSidebarAtom } from '@/atoms/layoutAtoms';
import { useViewport } from '@/hooks/useViewport';
import { cn } from '@/utils/cn';

export function HamburgerButton() {
  const toggleSidebar = useSetAtom(toggleSidebarAtom);
  const { isMobile } = useViewport();

  if (!isMobile) return null;

  return (
    <button
      onClick={() => toggleSidebar()}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14',
        'glass rounded-full',
        'shadow-apple-float',
        'flex items-center justify-center',
        'transition-all duration-200 ease-apple',
        'hover:scale-105',
        'active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2'
      )}
      aria-label="Toggle menu"
    >
      <svg
        className="w-6 h-6 text-content-primary"
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
