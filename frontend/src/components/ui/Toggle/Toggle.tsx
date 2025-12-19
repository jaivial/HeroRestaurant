import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, size = 'md', className, disabled, checked, ...props }, ref) => {
    const sizes = {
      sm: {
        track: 'w-9 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-4',
      },
      md: {
        track: 'w-[51px] h-[31px]',
        thumb: 'w-[27px] h-[27px]',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-8',
        thumb: 'w-7 h-7',
        translate: 'translate-x-6',
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
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            {...props}
          />

          {/* Track */}
          <div
            className={cn(
              currentSize.track,
              'rounded-full',
              'bg-content-quaternary/30',
              'transition-colors duration-250 ease-apple',
              'peer-checked:bg-apple-green',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-apple-blue peer-focus-visible:ring-offset-2'
            )}
          />

          {/* Thumb */}
          <div
            className={cn(
              currentSize.thumb,
              'absolute top-[2px] left-[2px]',
              'bg-white rounded-full shadow-apple-md',
              'transition-transform duration-250 ease-apple-spring',
              `peer-checked:${currentSize.translate}`
            )}
          />
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

Toggle.displayName = 'Toggle';
