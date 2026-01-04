import React, { useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface SlideOutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  style?: React.CSSProperties;
}

export const SlideOut = memo(function SlideOut({
  isOpen,
  onClose,
  children,
  title,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  width = 'lg',
  className = '',
  style,
}: SlideOutProps) {
  const theme = useAtomValue(themeAtom);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'w-[400px]',
    md: 'w-[560px]',
    lg: 'w-[720px]',
    xl: 'w-[960px]',
    full: 'w-screen',
  };

  const panelClasses = cn(
    'fixed top-0 right-0 h-screen flex flex-col backdrop-blur-[20px] saturate-[180%] border-l overflow-hidden',
    'animate-slide-in-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    widthClasses[width],
    theme === 'dark'
      ? 'bg-black/90 border-white/10 shadow-[-32px_0_64px_rgba(0,0,0,0.5)]'
      : 'bg-white/90 border-white/[0.18] shadow-[-32px_0_64px_rgba(0,0,0,0.15)]',
    className
  );

  const backdropClasses = cn(
    'fixed inset-0 backdrop-blur-[8px] animate-fade-in duration-300',
    theme === 'dark' ? 'bg-black/40' : 'bg-black/20'
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-end">
      <div
        className={backdropClasses}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div className={panelClasses} style={style} role="dialog" aria-modal="true">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-current/10">
            {title && (
              <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-[44px] h-[44px] rounded-full hover:bg-apple-gray-100/50 active:bg-apple-gray-100 transition-all duration-200 active:scale-95 ml-auto"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6 text-content-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});
