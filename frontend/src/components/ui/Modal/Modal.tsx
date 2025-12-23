import React, { useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Modal
 * Follows Apple aesthetic for centered overlays with Liquid Glass effect.
 */
export const Modal = memo(function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  style,
}: ModalProps) {
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

  const sizeClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[720px]',
    xl: 'max-w-[960px]',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  };

  const panelClasses = cn(
    'relative w-full rounded-[2.2rem] backdrop-blur-[20px] saturate-[180%] border',
    'animate-scale-in duration-300 ease-[cubic-bezier(0,0,0.2,1)]',
    'flex flex-col max-h-[95dvh]',
    theme === 'dark'
      ? 'bg-black/80 border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] text-white'
      : 'bg-white/90 border-black/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.15)] text-black',
    className
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity duration-300',
          'animate-fade-in'
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        style={style}
        className={cn('relative w-full overflow-hidden', sizeClasses[size], panelClasses)}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex-shrink-0 flex items-start justify-between px-8 pt-8 pb-4">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className={cn(
                    'text-[28px] font-semibold leading-tight',
                    theme === 'dark' ? 'text-white' : 'text-black'
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn(
                  'mt-2 text-[17px]',
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                )}>
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'p-2 -mr-2 -mt-2 rounded-full transition-colors duration-200',
                  theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-black/40 hover:text-black hover:bg-black/5',
                  'focus:outline-none'
                )}
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 overflow-y-auto px-8 custom-scrollbar', title ? 'pb-8' : 'py-8')}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});

/* =============================================================================
   ModalFooter Component
   ============================================================================= */

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalFooter = memo(function ModalFooter({ 
  children, 
  className = '', 
  style 
}: ModalFooterProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      style={style}
      className={cn(
        'flex items-center justify-end gap-4',
        'px-8 py-5 mt-4',
        'border-t',
        theme === 'dark' ? 'border-white/10' : 'border-black/5',
        '-mx-8 -mb-8', // Align with parent padding
        className
      )}
    >
      {children}
    </div>
  );
});
