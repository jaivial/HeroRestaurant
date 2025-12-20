import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const defaultIcons: Record<AlertVariant, ReactNode> = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const variantClasses: Record<AlertVariant, { bg: string; icon: string; border: string }> = {
    info: {
      bg: 'bg-apple-blue/15',
      icon: 'text-apple-blue',
      border: 'border-apple-blue/25',
    },
    success: {
      bg: 'bg-apple-green/15',
      icon: 'text-apple-green',
      border: 'border-apple-green/25',
    },
    warning: {
      bg: 'bg-apple-orange/15',
      icon: 'text-apple-orange',
      border: 'border-apple-orange/25',
    },
    error: {
      bg: 'bg-apple-red/15',
      icon: 'text-apple-red',
      border: 'border-apple-red/25',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        'p-4 rounded-[0.875rem]',
        'border',
        styles.bg,
        styles.border,
        className
      )}
      role="alert"
    >
      <span className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        {icon || defaultIcons[variant]}
      </span>

      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-content-primary mb-0.5">{title}</p>
        )}
        <div className="text-sm text-content-secondary">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 -mr-1 -mt-1',
            'rounded-md',
            'text-content-tertiary hover:text-content-primary',
            'hover:bg-black/5 dark:hover:bg-white/5',
            'transition-colors duration-150'
          )}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
