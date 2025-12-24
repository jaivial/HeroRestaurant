import React, { useState, useRef, useEffect, createContext, useContext, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

/* =============================================================================
   Tabs Context
   ============================================================================= */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  theme?: 'light' | 'dark';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

/* =============================================================================
   Tabs Root
   ============================================================================= */

interface TabsProps {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
}

/**
 * Layer 3: UI Component - Tabs
 */
export const Tabs = memo(function Tabs({
  defaultValue,
  value,
  onChange,
  children,
  className = '',
  style,
  theme: propTheme,
}: TabsProps) {
  const globalTheme = useAtomValue(themeAtom);
  const theme = propTheme || globalTheme;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, theme }}>
      <div className={className} style={style}>{children}</div>
    </TabsContext.Provider>
  );
});

/* =============================================================================
   TabsList - Segmented Control Style
   ============================================================================= */

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'pills' | 'underline' | 'glass';
}

export const TabsList = memo(function TabsList({ children, className = '', style, variant = 'default' }: TabsListProps) {
  const globalTheme = useAtomValue(themeAtom);
  const { activeTab, theme: contextTheme } = useTabsContext();
  const theme = contextTheme || globalTheme;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeButton = listRef.current?.querySelector(
      `[data-tab-id="${activeTab}"]`
    ) as HTMLButtonElement | null;

    if (activeButton && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - listRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  if (variant === 'glass') {
    return (
      <div
        ref={listRef}
        style={style}
        className={cn(
          'relative inline-flex p-1 rounded-[1.2rem] overflow-hidden border backdrop-blur-[20px] saturate-[180%]',
          theme === 'dark' ? 'bg-[#1C1C1E]/60 border-white/15' : 'bg-black/5 border-black/5',
          className
        )}
        role="tablist"
      >
        <div
          className={cn(
            'absolute top-1 h-[calc(100%-0.5rem)] rounded-[1rem] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-sm',
            theme === 'dark' ? 'bg-white/[0.12]' : 'bg-white'
          )}
          style={indicatorStyle}
        />
        {children}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        ref={listRef}
        style={style}
        className={cn(
          'relative flex border-b',
          theme === 'dark' ? 'border-white/10' : 'border-black/5',
          className
        )}
        role="tablist"
      >
        {children}
        <div
          className={cn(
            'absolute bottom-0 h-[2px] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
            theme === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#007AFF]'
          )}
          style={indicatorStyle}
        />
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div
        ref={listRef}
        style={style}
        className={cn('flex gap-2', className)}
        role="tablist"
      >
        {children}
      </div>
    );
  }

  // Default: Segmented control style (Apple aesthetic)
  return (
    <div
      ref={listRef}
      style={style}
      className={cn(
        'relative inline-flex p-1 rounded-[1rem] transition-colors',
        theme === 'dark' ? 'bg-white/[0.08] border border-white/10' : 'bg-black/5',
        className
      )}
      role="tablist"
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          'absolute top-1 h-[calc(100%-0.5rem)] rounded-[0.8rem] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-sm',
          theme === 'dark' ? 'bg-white/[0.12]' : 'bg-white'
        )}
        style={indicatorStyle}
      />
      {children}
    </div>
  );
});

/* =============================================================================
   TabsTrigger
   ============================================================================= */

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const TabsTrigger = memo(function TabsTrigger({
  value,
  children,
  className = '',
  style,
  disabled,
}: TabsTriggerProps) {
  const globalTheme = useAtomValue(themeAtom);
  const { activeTab, setActiveTab, theme: contextTheme } = useTabsContext();
  const theme = contextTheme || globalTheme;
  const isActive = activeTab === value;

  return (
    <button
      style={style}
      type="button"
      role="tab"
      data-tab-id={value}
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative z-10 px-6 py-2 text-[15px] font-semibold rounded-[0.8rem] transition-all duration-200 focus:outline-none',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        isActive
          ? (theme === 'dark' ? 'text-white' : 'text-black')
          : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'),
        className
      )}
    >
      {children}
    </button>
  );
});

/* =============================================================================
   TabsContent
   ============================================================================= */

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const TabsContent = memo(function TabsContent({ value, children, className = '', style }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      style={style}
      className={cn('animate-fade-in duration-300', className)}
    >
      {children}
    </div>
  );
});
