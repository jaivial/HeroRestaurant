import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, size = 'md', className, disabled, ...props }, ref) => {
    const sizes = {
      sm: {
        outer: 'w-4 h-4',
        inner: 'w-2 h-2',
      },
      md: {
        outer: 'w-5 h-5',
        inner: 'w-2.5 h-2.5',
      },
      lg: {
        outer: 'w-6 h-6',
        inner: 'w-3 h-3',
      },
    };

    const currentSize = sizes[size];

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
            type="radio"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />

          {/* Radio outer circle */}
          <div
            className={cn(
              currentSize.outer,
              'rounded-full',
              'border-2 border-content-quaternary',
              'bg-surface-primary',
              'transition-all duration-200 ease-apple',
              'peer-checked:border-apple-blue',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-apple-blue peer-focus-visible:ring-offset-2',
              'flex items-center justify-center'
            )}
          >
            {/* Inner dot */}
            <div
              className={cn(
                currentSize.inner,
                'rounded-full bg-apple-blue',
                'opacity-0 scale-0',
                'transition-all duration-200 ease-apple-spring',
                'peer-checked:opacity-100 peer-checked:scale-100'
              )}
            />
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

Radio.displayName = 'Radio';

/* =============================================================================
   RadioGroup Component
   ============================================================================= */

interface RadioGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function RadioGroup({
  children,
  label,
  error,
  className,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <fieldset className={cn('w-full', className)}>
      {label && (
        <legend className="text-sm font-medium text-content-secondary mb-2">
          {label}
        </legend>
      )}

      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4'
        )}
      >
        {children}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-apple-red">{error}</p>
      )}
    </fieldset>
  );
}
