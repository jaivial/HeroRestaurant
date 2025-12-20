import { Switch } from '@headlessui/react';
import { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface ToggleProps {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ label, description, size = 'md', className, disabled, checked, onChange, name, id }, ref) => {
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
      <div className={cn('inline-flex items-start gap-3', className)}>
        <Switch
          ref={ref}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
          id={id}
          className={cn(
            currentSize.track,
            'relative inline-flex items-center rounded-full border-2 transition-colors duration-250 ease-apple focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
            checked
              ? 'bg-black dark:bg-apple-green border-black dark:border-apple-green-hover shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-apple-gray-300 dark:bg-apple-gray-800 border-apple-gray-500 dark:border-apple-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'cursor-pointer'
          )}
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={cn(
              currentSize.thumb,
              'inline-block transform rounded-full bg-white shadow-apple-md transition duration-250 ease-apple-spring',
              checked ? currentSize.translate : 'translate-x-[2px]'
            )}
          />
        </Switch>

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
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
