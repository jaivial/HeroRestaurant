import React, { forwardRef, useState, useRef, useEffect, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export interface SelectOption {
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
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

/**
 * Layer 3: UI Component - Select
 * Follows Apple aesthetic for dropdown menus.
 */
export const Select = memo(
  forwardRef<HTMLButtonElement, SelectProps>(
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
        className = '',
        style,
        icon,
      },
      ref
    ) => {
      const theme = useAtomValue(themeAtom);
      const [isOpen, setIsOpen] = useState(false);
      const [internalValue, setInternalValue] = useState(defaultValue || '');
      const containerRef = useRef<HTMLDivElement>(null);

      const currentValue = value !== undefined ? value : internalValue;
      const selectedOption = options.find((opt) => opt.value === currentValue);
      const hasError = Boolean(error);

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };

        if (isOpen) {
          document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, [isOpen]);

      useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
          document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
      }, [isOpen]);

      const handleSelect = (optionValue: string) => {
        if (value === undefined) {
          setInternalValue(optionValue);
        }
        onChange?.(optionValue);
        setIsOpen(false);
      };

      const labelClasses = cn(
        'block text-[14px] font-medium mb-2',
        theme === 'dark' ? 'text-white/60' : 'text-black/60',
        disabled && 'opacity-50'
      );

      const triggerClasses = cn(
        'w-full h-[44px] px-4 rounded-[1rem] flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none',
        'text-[17px] border-[1.5px]',
        theme === 'dark'
          ? 'bg-white/5 border-white/10 text-white focus:border-[#0A84FF]'
          : 'bg-black/5 border-black/5 text-black focus:border-[#007AFF]',
        disabled && 'opacity-50 cursor-not-allowed',
        hasError && (theme === 'dark' ? 'border-[#FF453A]' : 'border-[#FF3B30]'),
        isOpen && (theme === 'dark' ? 'border-[#0A84FF]' : 'border-[#007AFF]')
      );

      const dropdownClasses = cn(
        'absolute z-50 w-full mt-2 py-2 rounded-[1rem] backdrop-blur-[20px] saturate-[180%] border',
        'animate-scale-in origin-top shadow-xl',
        theme === 'dark'
          ? 'bg-black/80 border-white/10'
          : 'bg-white/80 border-black/5'
      );

      const helperClasses = cn(
        'mt-1.5 text-[12px]',
        hasError 
          ? (theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]') 
          : (theme === 'dark' ? 'text-white/40' : 'text-black/40')
      );

      return (
        <div ref={containerRef} className={cn('w-full relative', className)} style={style}>
          {label && <label className={labelClasses}>{label}</label>}

          <button
            ref={ref}
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={triggerClasses}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {icon && <span className="opacity-40 flex-shrink-0">{icon}</span>}
              <span className={cn(!selectedOption && 'opacity-30', 'truncate')}>
                {selectedOption?.label || placeholder}
              </span>
            </div>

            <svg
              className={cn(
                'w-4 h-4 opacity-40 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className={dropdownClasses}>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150',
                    'text-[17px]',
                    theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5',
                    disabled && 'opacity-50 cursor-not-allowed',
                    option.value === currentValue && (theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]')
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.value === currentValue && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {(error || helperText) && (
            <p className={helperClasses}>
              {error || helperText}
            </p>
          )}
        </div>
      );
    }
  )
);

Select.displayName = 'Select';
