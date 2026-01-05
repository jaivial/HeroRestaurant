import { forwardRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = memo(
  forwardRef<HTMLInputElement, DatePickerProps>(
    ({ value, onChange, min, max, className = '', disabled }, ref) => {
      const theme = useAtomValue(themeAtom);

      return (
        <div className={`relative ${className}`}>
          <input
            ref={ref}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            disabled={disabled}
            className={`
              w-full h-[44px] px-4
              bg-white/72 dark:bg-black/50
              backdrop-blur-[20px] saturate-[180%]
              border border-white/[0.18] dark:border-white/10
              rounded-[1rem] text-[15px]
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${theme === 'dark' ? 'dark-datepicker' : ''}
            `}
          />
        </div>
      );
    }
  )
);

DatePicker.displayName = 'DatePicker';
