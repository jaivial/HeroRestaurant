import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
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
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Linear Progress
 * Follows Apple aesthetic for activity indicators.
 */
export const Progress = memo(function Progress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  indeterminate = false,
  className = '',
  style,
}: ProgressProps) {
  const theme = useAtomValue(themeAtom);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-[4px]',
    md: 'h-[8px]',
    lg: 'h-[12px]',
  };

  const variantColors = {
    default: theme === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#007AFF]',
    success: theme === 'dark' ? 'bg-[#30D158]' : 'bg-[#34C759]',
    warning: theme === 'dark' ? 'bg-[#FF9F0A]' : 'bg-[#FF9500]',
    error: theme === 'dark' ? 'bg-[#FF453A]' : 'bg-[#FF3B30]',
  };

  return (
    <div className={cn('w-full', className)} style={style}>
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          theme === 'dark' ? 'bg-white/10' : 'bg-black/5',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
            variantColors[variant],
            indeterminate && 'animate-indeterminate w-1/3'
          )}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>

      {showValue && !indeterminate && (
        <p className={cn(
          'mt-2 text-[12px] text-right font-medium',
          theme === 'dark' ? 'text-white/40' : 'text-black/40'
        )}>
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
});

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
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Circular Progress
 */
export const CircularProgress = memo(function CircularProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 48,
  strokeWidth = 4,
  showValue = false,
  indeterminate = false,
  className = '',
  style,
}: CircularProgressProps) {
  const theme = useAtomValue(themeAtom);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]',
    success: theme === 'dark' ? 'text-[#30D158]' : 'text-[#34C759]',
    warning: theme === 'dark' ? 'text-[#FF9F0A]' : 'text-[#FF9500]',
    error: theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ ...style, width: size, height: size }}
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
          className={theme === 'dark' ? 'text-white/10' : 'text-black/5'}
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
            variantColors[variant],
            'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
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
            'absolute inset-0 flex items-center justify-center text-[12px] font-semibold',
            theme === 'dark' ? 'text-white' : 'text-black'
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
});

/* =============================================================================
   Spinner (Simple loading indicator)
   ============================================================================= */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'default' | 'primary' | 'white';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Spinner
 */
export const Spinner = memo(function Spinner({ size = 'md', variant = 'default', className = '', style }: SpinnerProps) {
  const theme = useAtomValue(themeAtom);
  
  const sizeValue = typeof size === 'number' 
    ? size 
    : { sm: 16, md: 24, lg: 32 }[size];

  const variantColors = {
    default: theme === 'dark' ? 'text-white/40' : 'text-black/40',
    primary: theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]',
    white: 'text-white',
  };

  return (
    <svg
      className={cn('animate-spin', variantColors[variant], className)}
      style={{ ...style, width: sizeValue, height: sizeValue }}
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
});
