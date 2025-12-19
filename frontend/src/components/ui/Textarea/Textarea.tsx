import { forwardRef, useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  className?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      className,
      wrapperClassName,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const hasError = Boolean(error);

    // Auto-resize logic
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to calculate scrollHeight accurately
      textarea.style.height = 'auto';

      // Calculate line height
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

        <textarea
          ref={textareaRef}
          disabled={disabled}
          onChange={handleChange}
          rows={autoResize ? minRows : props.rows || minRows}
          className={cn(
            // Base styles
            'w-full rounded-[0.875rem] resize-none',
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

            // Padding
            'px-4 py-3',

            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
