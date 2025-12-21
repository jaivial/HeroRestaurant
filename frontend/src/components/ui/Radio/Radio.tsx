import React, { forwardRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Layer 3: UI Component - Radio
 * Follows Apple aesthetic for selection lists.
 */
export const Radio = memo(
  forwardRef<HTMLInputElement, RadioProps>(
    ({ label, description, size = 'md', className = '', style, disabled, ...props }, ref) => {
      const theme = useAtomValue(themeAtom);

      const sizes = {
        sm: { outer: 'w-[18px] h-[18px]', inner: 'w-[8px] h-[8px]' },
        md: { outer: 'w-[22px] h-[22px]', inner: 'w-[10px] h-[10px]' },
        lg: { outer: 'w-[26px] h-[26px]', inner: 'w-[12px] h-[12px]' },
      };

      const currentSize = sizes[size];

      const outerClasses = cn(
        currentSize.outer,
        'rounded-full border-[1.5px] transition-all duration-200 flex items-center justify-center',
        theme === 'dark'
          ? 'bg-white/5 border-white/10 peer-checked:border-[#0A84FF]'
          : 'bg-black/5 border-black/10 peer-checked:border-[#007AFF]'
      );

      const innerClasses = cn(
        currentSize.inner,
        'rounded-full transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        'opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100',
        theme === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#007AFF]'
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
              type="radio"
              className="sr-only peer"
              disabled={disabled}
              {...props}
            />

            <div className={outerClasses}>
              <div className={innerClasses} />
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

Radio.displayName = 'Radio';

/* =============================================================================
   RadioGroup Component
   ============================================================================= */

interface RadioGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  label?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = memo(function RadioGroup({
  children,
  label,
  error,
  className = '',
  style,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <fieldset className={cn('w-full', className)} style={style} {...props}>
      {label && (
        <legend className={cn(
          'text-[14px] font-medium mb-3',
          theme === 'dark' ? 'text-white/60' : 'text-black/60'
        )}>
          {label}
        </legend>
      )}

      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-6'
        )}
      >
        {children}
      </div>

      {error && (
        <p className={cn(
          'mt-2 text-[12px]',
          theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]'
        )}>
          {error}
        </p>
      )}
    </fieldset>
  );
});
