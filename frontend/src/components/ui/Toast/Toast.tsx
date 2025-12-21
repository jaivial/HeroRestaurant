import React, { useEffect, useState, createContext, useContext, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

/* =============================================================================
   Toast Types
   ============================================================================= */

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

/* =============================================================================
   Toast Context
   ============================================================================= */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* =============================================================================
   Toast Provider
   ============================================================================= */

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = memo(function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
});

/* =============================================================================
   Toast Container
   ============================================================================= */

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const ToastContainer = memo(function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-[400px] w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
});

/* =============================================================================
   Toast Item
   ============================================================================= */

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ToastItem = memo(function ToastItem({ toast, onRemove }: ToastItemProps) {
  const theme = useAtomValue(themeAtom);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    const hideTimer = setTimeout(() => setIsExiting(true), duration);
    const removeTimer = setTimeout(() => onRemove(toast.id), duration + 300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [onRemove, toast.id]);

  const icons: Record<ToastType, React.ReactNode> = {
    info: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const iconColors: Record<ToastType, string> = {
    info: theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]',
    success: theme === 'dark' ? 'text-[#30D158]' : 'text-[#34C759]',
    warning: theme === 'dark' ? 'text-[#FF9F0A]' : 'text-[#FF9500]',
    error: theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]',
  };

  const toastClasses = cn(
    'pointer-events-auto w-full p-5 flex items-start gap-4 rounded-[1.5rem] backdrop-blur-[20px] saturate-[180%] border',
    'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
    theme === 'dark'
      ? 'bg-black/80 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
      : 'bg-white/80 border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]',
    isExiting ? 'opacity-0 scale-95 translate-x-10' : 'animate-slide-in-right'
  );

  return (
    <div className={toastClasses} role="alert">
      <span className={cn('flex-shrink-0', iconColors[toast.type])}>
        {icons[toast.type]}
      </span>

      <div className="flex-1 min-w-0 pt-0.5">
        <p className={cn(
          'text-[17px] font-semibold leading-tight',
          theme === 'dark' ? 'text-white' : 'text-black'
        )}>
          {toast.title}
        </p>
        {toast.description && (
          <p className={cn(
            'mt-1 text-[14px]',
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          )}>
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'flex-shrink-0 p-1 rounded-full transition-colors duration-200',
          theme === 'dark' ? 'text-white/30 hover:text-white hover:bg-white/10' : 'text-black/30 hover:text-black hover:bg-black/5',
          'focus:outline-none'
        )}
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

/* =============================================================================
   Convenience Functions
   ============================================================================= */

export const toast = {
  info: (title: string, description?: string, duration?: number) => ({
    type: 'info' as const,
    title,
    description,
    duration,
  }),
  success: (title: string, description?: string, duration?: number) => ({
    type: 'success' as const,
    title,
    description,
    duration,
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    type: 'warning' as const,
    title,
    description,
    duration,
  }),
  error: (title: string, description?: string, duration?: number) => ({
    type: 'error' as const,
    title,
    description,
    duration,
  }),
};
