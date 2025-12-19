import { forwardRef, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select...',
      label,
      error,
      helperText,
      disabled,
      className,
      icon,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const containerRef = useRef<HTMLDivElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);
    const hasError = Boolean(error);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setIsOpen(false);
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSelect = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className={cn('w-full relative', className)}>
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

        {/* Trigger button */}
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between gap-2',
            'px-4 py-2.5 rounded-[0.875rem]',
            'glass-subtle border border-transparent',
            'text-left text-content-primary',
            'transition-all duration-200 ease-apple',
            'focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError && 'border-apple-red focus:border-apple-red focus:ring-apple-red/20',
            isOpen && 'border-apple-blue ring-2 ring-apple-blue/20'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-content-tertiary flex-shrink-0">{icon}</span>}
            <span className={cn(!selectedOption && 'text-content-quaternary', 'truncate')}>
              {selectedOption?.label || placeholder}
            </span>
          </div>

          {/* Chevron */}
          <svg
            className={cn(
              'w-4 h-4 text-content-tertiary flex-shrink-0',
              'transition-transform duration-200 ease-apple',
              isOpen && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-2',
              'py-1 rounded-[0.875rem]',
              'glass-solid shadow-apple-xl',
              'border border-content-quaternary/10',
              'animate-scale-in origin-top'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center justify-between',
                  'px-4 py-2.5 text-left',
                  'text-content-primary',
                  'transition-colors duration-150 ease-apple',
                  'hover:bg-surface-tertiary',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  option.value === currentValue && 'text-apple-blue'
                )}
              >
                <span>{option.label}</span>
                {option.value === currentValue && (
                  <svg className="w-4 h-4 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

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

Select.displayName = 'Select';
