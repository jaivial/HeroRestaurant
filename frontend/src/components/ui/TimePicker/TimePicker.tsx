import { forwardRef, memo, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  interval?: number;
  minTime?: string;
  maxTime?: string;
  className?: string;
  disabled?: boolean;
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export const TimePicker = memo(
  forwardRef<HTMLButtonElement, TimePickerProps>(
    ({ 
      value, 
      onChange, 
      interval = 30, 
      minTime = '06:00', 
      maxTime = '23:30',
      className = '',
      disabled 
    }, ref) => {
      const theme = useAtomValue(themeAtom);
      const [isOpen, setIsOpen] = useState(false);

      const filteredSlots = TIME_SLOTS.filter((slot) => {
        if (minTime && slot < minTime) return false;
        if (maxTime && slot > maxTime) return false;
        const minutes = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);
        return minutes % interval === 0;
      });

      const handleSelect = useCallback((time: string) => {
        onChange(time);
        setIsOpen(false);
      }, [onChange]);

      const handleClickOutside = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.time-picker-container')) {
          setIsOpen(false);
        }
      }, []);

      return (
        <div className={`relative time-picker-container ${className}`}>
          <button
            ref={ref}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full h-[44px] px-4 text-left
              bg-white/72 dark:bg-black/50
              backdrop-blur-[20px] saturate-[180%]
              border border-white/[0.18] dark:border-white/10
              rounded-[1rem] text-[15px]
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-between
              ${isOpen ? 'ring-2 ring-blue-500/50' : ''}
            `}
          >
            <span>{value || 'Select time'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={handleClickOutside}
              />
              <div className={`
                absolute z-50 mt-2
                bg-white/95 dark:bg-gray-900/95
                backdrop-blur-[20px] saturate-[180%]
                border border-white/[0.18] dark:border-white/10
                rounded-[1rem] shadow-xl
                max-h-64 overflow-y-auto
                w-full min-w-[160px]
              `}>
                <div className="p-2">
                  {filteredSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleSelect(time)}
                      className={`
                        w-full px-3 py-2 text-left text-[15px] rounded-lg
                        transition-colors duration-150
                        ${value === time
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
  )
);

TimePicker.displayName = 'TimePicker';
