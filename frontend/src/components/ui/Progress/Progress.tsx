import { cn } from '../../../utils/cn';

/* =============================================================================
   Linear Progress
   ============================================================================= */

interface ProgressProps {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export function Progress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  indeterminate = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-apple-blue',
    success: 'bg-apple-green',
    warning: 'bg-apple-orange',
    error: 'bg-apple-red',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-surface-tertiary',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full',
            'transition-all duration-300 ease-apple',
            variantClasses[variant],
            indeterminate && 'animate-indeterminate'
          )}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>

      {showValue && !indeterminate && (
        <p className="mt-1 text-xs text-content-secondary text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}

/* =============================================================================
   Circular Progress
   ============================================================================= */

interface CircularProgressProps {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export function CircularProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 48,
  strokeWidth = 4,
  showValue = false,
  indeterminate = false,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantClasses = {
    default: 'text-apple-blue',
    success: 'text-apple-green',
    warning: 'text-apple-orange',
    error: 'text-apple-red',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg
        className={cn(
          'transform -rotate-90',
          indeterminate && 'animate-spin'
        )}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-surface-tertiary"
          stroke="currentColor"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          className={cn(
            variantClasses[variant],
            'transition-all duration-300 ease-apple'
          )}
          stroke="currentColor"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
        />
      </svg>

      {showValue && !indeterminate && (
        <span
          className={cn(
            'absolute inset-0',
            'flex items-center justify-center',
            'text-xs font-medium text-content-primary'
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

/* =============================================================================
   Spinner (Simple loading indicator)
   ============================================================================= */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'default', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variantClasses = {
    default: 'text-content-tertiary',
    primary: 'text-apple-blue',
    white: 'text-white',
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
