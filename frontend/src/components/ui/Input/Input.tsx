import React, { forwardRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  variant?: 'default' | 'filled' | 'ghost';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

/**
 * Layer 3: UI Component - Input
 * Follows Apple aesthetic for form elements.
 */
export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        error,
        helperText,
        variant = 'default',
        leftIcon,
        rightIcon,
        className = '',
        style,
        wrapperClassName = '',
        disabled,
        ...props
      },
      ref
    ) => {
      const theme = useAtomValue(themeAtom);
      const isDark = theme === 'dark';
      const hasError = Boolean(error);

      const labelClasses = cn(
        'block text-[14px] font-medium mb-2',
        isDark ? 'text-white/60' : 'text-black/60',
        disabled && 'opacity-50'
      );

      const inputBaseClasses = cn(
        'w-full h-[44px] rounded-[1rem] transition-all duration-200 focus:outline-none',
        'text-[17px]',
        leftIcon ? 'pl-11' : 'pl-4',
        rightIcon ? 'pr-11' : 'pr-4',
        disabled && 'opacity-50 cursor-not-allowed'
      );

      const variantClasses = {
        default: isDark
          ? 'bg-white/5 border-white/10 focus:border-[#0A84FF] text-white placeholder:text-white/30'
          : 'bg-black/5 border-black/5 focus:border-[#007AFF] text-black placeholder:text-black/30',
        filled: isDark
          ? 'bg-white/10 border-transparent focus:bg-white/15 text-white placeholder:text-white/30'
          : 'bg-black/5 border-transparent focus:bg-black/10 text-black placeholder:text-black/30',
        ghost: 'bg-transparent border-transparent text-current',
      };

      const errorClasses = isDark
        ? 'border-[#FF453A] focus:border-[#FF453A]'
        : 'border-[#FF3B30] focus:border-[#FF3B30]';

      const helperClasses = cn(
        'mt-1.5 text-[12px]',
        hasError 
          ? (isDark ? 'text-[#FF453A]' : 'text-[#FF3B30]') 
          : (isDark ? 'text-white/40' : 'text-black/40')
      );

      return (
        <div className={cn('w-full', wrapperClassName)} style={style}>
          {label && <label className={labelClasses}>{label}</label>}

          <div className="relative">
            {leftIcon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-current opacity-40">
                {leftIcon}
              </div>
            )}

            <input
              ref={ref}
              disabled={disabled}
              className={cn(
                inputBaseClasses,
                variantClasses[variant],
                hasError && errorClasses,
                'border-[1.5px]',
                className
              )}
              {...props}
            />

            {rightIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-current opacity-40">
                {rightIcon}
              </div>
            )}
          </div>

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

Input.displayName = 'Input';
