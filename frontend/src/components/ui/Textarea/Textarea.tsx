import React, { forwardRef, useEffect, useRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  wrapperClassName?: string;
}

/**
 * Layer 3: UI Component - Textarea
 * Follows Apple aesthetic for multi-line text input.
 */
export const Textarea = memo(
  forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
      {
        label,
        error,
        helperText,
        variant = 'default',
        autoResize = false,
        minRows = 3,
        maxRows = 10,
        className = '',
        style,
        wrapperClassName = '',
        disabled,
        onChange,
        ...props
      },
      ref
    ) => {
      const theme = useAtomValue(themeAtom);
      const internalRef = useRef<HTMLTextAreaElement>(null);
      const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
      const hasError = Boolean(error);

      const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea || !autoResize) return;

        textarea.style.height = 'auto';
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);

        const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
        const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      };

      useEffect(() => {
        adjustHeight();
      }, [props.value, autoResize]);

      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
        adjustHeight();
      };

      const labelClasses = cn(
        'block text-[14px] font-medium mb-2',
        theme === 'dark' ? 'text-white/60' : 'text-black/60',
        disabled && 'opacity-50'
      );

      const textareaBaseClasses = cn(
        'w-full rounded-[1rem] resize-none transition-all duration-200 focus:outline-none',
        'text-[17px] px-4 py-3 border-[1.5px]',
        disabled && 'opacity-50 cursor-not-allowed'
      );

      const variantClasses = {
        default: theme === 'dark'
          ? 'bg-white/5 border-white/10 text-white focus:border-[#0A84FF] placeholder:text-white/30'
          : 'bg-black/5 border-black/5 text-black focus:border-[#007AFF] placeholder:text-black/30',
        filled: theme === 'dark'
          ? 'bg-white/10 border-transparent focus:bg-white/15 text-white placeholder:text-white/30'
          : 'bg-black/5 border-transparent focus:bg-black/10 text-black placeholder:text-black/30',
      };

      const errorClasses = theme === 'dark'
        ? 'border-[#FF453A] focus:border-[#FF453A]'
        : 'border-[#FF3B30] focus:border-[#FF3B30]';

      const helperClasses = cn(
        'mt-1.5 text-[12px]',
        hasError 
          ? (theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]') 
          : (theme === 'dark' ? 'text-white/40' : 'text-black/40')
      );

      return (
        <div className={cn('w-full', wrapperClassName)} style={style}>
          {label && <label className={labelClasses}>{label}</label>}

          <textarea
            ref={textareaRef}
            disabled={disabled}
            onChange={handleChange}
            rows={autoResize ? minRows : props.rows || minRows}
            className={cn(
              textareaBaseClasses,
              variantClasses[variant],
              hasError && errorClasses,
              className
            )}
            {...props}
          />

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

Textarea.displayName = 'Textarea';
