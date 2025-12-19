import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      leftIcon,
      rightIcon,
      className,
      wrapperClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium mb-1.5',
              'text-content-secondary',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-content-tertiary',
                'pointer-events-none'
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full rounded-[0.875rem]',
              'text-content-primary placeholder:text-content-quaternary',
              'transition-all duration-200 ease-apple',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',

              // Variant styles
              {
                // Default - Subtle glass with border
                'glass-subtle border border-transparent focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20':
                  variant === 'default',

                // Filled - Solid background
                'bg-surface-tertiary border-2 border-transparent focus:border-apple-blue focus:bg-surface-secondary':
                  variant === 'filled',
              },

              // Error state
              hasError && 'border-apple-red focus:border-apple-red focus:ring-apple-red/20',

              // Padding based on icons
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              'py-2.5',

              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-content-tertiary'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              hasError ? 'text-apple-red' : 'text-content-tertiary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
