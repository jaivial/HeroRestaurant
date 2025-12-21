import React, { forwardRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Layer 3: UI Component - Checkbox
 * Follows Apple aesthetic for interactive selection elements.
 */
export const Checkbox = memo(
  forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, size = 'md', className = '', style, disabled, ...props }, ref) => {
      const theme = useAtomValue(themeAtom);

      const sizes = {
        sm: 'w-[18px] h-[18px]',
        md: 'w-[22px] h-[22px]',
        lg: 'w-[26px] h-[26px]',
      };

      const iconSizes = {
        sm: 'w-[12px] h-[12px]',
        md: 'w-[14px] h-[14px]',
        lg: 'w-[18px] h-[18px]',
      };

      const boxClasses = cn(
        sizes[size],
        'rounded-[6px] border-[1.5px] transition-all duration-200 flex items-center justify-center',
        theme === 'dark'
          ? 'bg-white/5 border-white/10 peer-checked:bg-[#0A84FF] peer-checked:border-[#0A84FF]'
          : 'bg-black/5 border-black/10 peer-checked:bg-[#007AFF] peer-checked:border-[#007AFF]'
      );

      return (
        <label
          style={style}
          className={cn(
            'inline-flex items-start gap-3 cursor-pointer select-none',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only peer"
              disabled={disabled}
              {...props}
            />

            <div className={boxClasses}>
              <svg
                className={cn(
                  iconSizes[size],
                  'text-white transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  'opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100'
                )}
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M11.5 4L5.5 10L2.5 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className={cn(
                  'text-[17px] font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-black'
                )}>
                  {label}
                </span>
              )}
              {description && (
                <span className={cn(
                  'text-[14px]',
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                )}>
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
      );
    }
  )
);

Checkbox.displayName = 'Checkbox';
