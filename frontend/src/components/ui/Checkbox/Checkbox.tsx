import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, size = 'md', className, disabled, ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
    };

    return (
      <label
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />

          {/* Checkbox box */}
          <div
            className={cn(
              sizes[size],
              'rounded-md',
              'border-2 border-content-quaternary',
              'bg-surface-primary',
              'transition-all duration-200 ease-apple',
              'peer-checked:bg-apple-blue peer-checked:border-apple-blue',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-apple-blue peer-focus-visible:ring-offset-2',
              'flex items-center justify-center'
            )}
          >
            {/* Checkmark icon */}
            <svg
              className={cn(
                iconSizes[size],
                'text-white',
                'opacity-0 scale-50',
                'transition-all duration-200 ease-apple-spring',
                'peer-checked:opacity-100 peer-checked:scale-100'
              )}
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M11.5 4L5.5 10L2.5 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-base font-medium text-content-primary">
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-content-secondary mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
