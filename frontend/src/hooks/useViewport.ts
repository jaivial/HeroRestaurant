import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isMobileViewportAtom } from '@/atoms/layoutAtoms';

export function useViewport() {
  const setIsMobile = useSetAtom(isMobileViewportAtom);
  const isMobile = useAtomValue(isMobileViewportAtom);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return {
    isMobile,
    isDesktop: !isMobile,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  };
}
