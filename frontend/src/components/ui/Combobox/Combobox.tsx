import React, { memo, useState, useMemo } from 'react';
import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Transition,
} from '@headlessui/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

export interface ComboboxItem {
  id: string;
  name: string;
  image?: string | null;
  [key: string]: any;
}

interface ComboboxProps {
  items: ComboboxItem[];
  selectedItem: ComboboxItem | null;
  onChange: (item: ComboboxItem) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Layer 3: UI Component - Combobox
 * A reusable, searchable dropdown component following the Apple Aesthetic.
 */
export const Combobox = memo(({
  items,
  selectedItem,
  onChange,
  placeholder = 'Search...',
  className,
  disabled = false,
}: ComboboxProps) => {
  const theme = useAtomValue(themeAtom);
  const [query, setQuery] = useState('');
  const isDark = theme === 'dark';

  const filteredItems = useMemo(() => {
    if (query === '') return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/80 border-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/80 border-black/5';

  return (
    <HeadlessCombobox
      value={selectedItem}
      onChange={(item) => item && onChange(item)}
      disabled={disabled}
    >
      <div className={cn('relative', className)}>
        <div className={cn(
          'relative w-full cursor-default overflow-hidden rounded-[1rem] text-left border transition-all duration-200',
          isDark 
            ? 'bg-white/5 border-white/10 text-white focus-within:border-[#0A84FF]' 
            : 'bg-black/5 border-black/5 text-black focus-within:border-[#007AFF]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <div className="flex items-center px-3 gap-2">
             {selectedItem?.image && (
               <img 
                 src={selectedItem.image} 
                 alt="" 
                 className="w-5 h-5 rounded-full object-cover flex-shrink-0" 
               />
             )}
            <ComboboxInput
              className={cn(
                'w-full border-none py-2.5 text-[17px] leading-5 focus:ring-0 bg-transparent outline-none',
                isDark ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/30'
              )}
              displayValue={(item: ComboboxItem) => item?.name ?? ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <ComboboxButton className="flex items-center pr-1">
              <svg
                className={cn('h-5 w-5 opacity-40')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ComboboxButton>
          </div>
        </div>

        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <ComboboxOptions className={cn(
            'absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-[1rem] py-2 text-base shadow-xl border focus:outline-none sm:text-sm',
            glassClasses
          )}>
            {filteredItems.length === 0 && query !== '' ? (
              <div className={cn(
                'relative cursor-default select-none py-2 px-4',
                isDark ? 'text-white/40' : 'text-black/40'
              )}>
                Nothing found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <ComboboxOption
                  key={item.id}
                  value={item}
                  className={({ focus }) => cn(
                    'relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors duration-150',
                    focus 
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black') 
                      : (isDark ? 'text-white/80' : 'text-black/80')
                  )}
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className={cn('block truncate font-medium', selected && 'text-apple-blue')}>
                          {item.name}
                        </span>
                      </div>
                      {selected && (
                        <span className={cn(
                          'absolute inset-y-0 left-0 flex items-center pl-3',
                          isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'
                        )}>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
});

Combobox.displayName = 'Combobox';
