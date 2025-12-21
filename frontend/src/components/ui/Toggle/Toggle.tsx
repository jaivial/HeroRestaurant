import React, { forwardRef, memo } from 'react';
import { Switch } from '@headlessui/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface ToggleProps {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

/**
 * Layer 3: UI Component - Toggle (Switch)
 * Follows Apple iOS toggle aesthetic.
 */
export const Toggle = memo(
  forwardRef<HTMLButtonElement, ToggleProps>(
    ({ label, description, size = 'md', className = '', style, disabled, checked, onChange, name, id }, ref) => {
      const theme = useAtomValue(themeAtom);

      const sizes = {
        sm: {
          track: 'w-[36px] h-[20px]',
          thumb: 'w-[16px] h-[16px]',
          translate: 'translate-x-[16px]',
        },
        md: {
          track: 'w-[51px] h-[31px]',
          thumb: 'w-[27px] h-[27px]',
          translate: 'translate-x-[20px]',
        },
        lg: {
          track: 'w-[64px] h-[36px]',
          thumb: 'w-[32px] h-[32px]',
          translate: 'translate-x-[28px]',
        },
      };

      const currentSize = sizes[size];

      const trackClasses = cn(
        'relative inline-flex items-center rounded-full transition-colors duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus:outline-none',
        checked
          ? (theme === 'dark' ? 'bg-[#30D158]' : 'bg-[#34C759]')
          : (theme === 'dark' ? 'bg-white/10' : 'bg-black/10'),
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      );

      const thumbClasses = cn(
        currentSize.thumb,
        'inline-block transform rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] transition duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        checked ? currentSize.translate : 'translate-x-[2px]'
      );

      return (
        <div className={cn('inline-flex items-start gap-4', className)} style={style}>
          <Switch
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            name={name}
            id={id}
            className={cn(currentSize.track, trackClasses)}
          >
            <span className="sr-only">{label}</span>
            <span aria-hidden="true" className={thumbClasses} />
          </Switch>

          {(label || description) && (
            <div className="flex flex-col select-none" onClick={() => !disabled && onChange(!checked)}>
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
        </div>
      );
    }
  )
);

Toggle.displayName = 'Toggle';
