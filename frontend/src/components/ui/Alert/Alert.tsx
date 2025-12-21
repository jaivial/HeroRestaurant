import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Alert
 * Follows Apple aesthetic for in-app notifications and status messages.
 */
export const Alert = memo(function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onDismiss,
  className = '',
  style,
}: AlertProps) {
  const theme = useAtomValue(themeAtom);

  const defaultIcons: Record<AlertVariant, React.ReactNode> = {
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

  const variantClasses: Record<AlertVariant, string> = {
    info: theme === 'dark' 
      ? 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20' 
      : 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
    success: theme === 'dark' 
      ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20' 
      : 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20',
    warning: theme === 'dark' 
      ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20' 
      : 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20',
    error: theme === 'dark' 
      ? 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' 
      : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20',
  };

  return (
    <div
      style={style}
      className={cn(
        'flex items-start gap-4 p-5 rounded-[1rem] border',
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      <span className="flex-shrink-0">
        {icon || defaultIcons[variant]}
      </span>

      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <p className="text-[17px] font-semibold leading-tight mb-1">{title}</p>
        )}
        <div className={cn(
          'text-[15px] leading-relaxed',
          theme === 'dark' ? 'text-white/80' : 'text-black/80'
        )}>
          {children}
        </div>
        {action && <div className="mt-4">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-full transition-colors duration-200',
            'opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5',
            'focus:outline-none'
          )}
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});
