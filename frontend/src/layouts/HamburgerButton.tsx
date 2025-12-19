import { useSetAtom } from 'jotai';
import { toggleSidebarAtom } from '@/atoms/layoutAtoms';
import { useViewport } from '@/hooks/useViewport';

export function HamburgerButton() {
  const toggleSidebar = useSetAtom(toggleSidebarAtom);
  const { isMobile } = useViewport();

  if (!isMobile) return null;

  return (
    <button
      onClick={() => toggleSidebar()}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 glass rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
      aria-label="Toggle menu"
    >
      <svg
        className="w-6 h-6 text-gray-700 dark:text-gray-200"
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
