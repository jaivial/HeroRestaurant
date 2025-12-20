import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'tinted';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-[0.875rem]',
        'transition-all duration-250 ease-apple',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',

        // Variant styles
        {
          // Primary - Solid blue
          'bg-apple-blue text-white shadow-apple-sm hover:bg-apple-blue-hover active:shadow-none':
            variant === 'primary',

          // Secondary - Subtle glass
          'glass-subtle text-content-primary hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800':
            variant === 'secondary',

          // Danger - Solid red
          'bg-apple-red text-white shadow-apple-sm hover:bg-apple-red-hover active:shadow-none':
            variant === 'danger',

          // Ghost - No background
          'text-content-primary hover:bg-surface-secondary active:bg-surface-tertiary':
            variant === 'ghost',

          // Tinted - Light blue background with blue text
          'bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20 active:bg-apple-blue/25':
            variant === 'tinted',
        },

        // Size styles
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2.5 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },

        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      )}
      {children}
    </button>
  );
}
