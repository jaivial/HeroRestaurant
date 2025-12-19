import { useState, useRef, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

/* =============================================================================
   Tabs Context
   ============================================================================= */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
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
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* =============================================================================
   TabsList - Segmented Control Style
   ============================================================================= */

interface TabsListProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsList({ children, className, variant = 'default' }: TabsListProps) {
  const { activeTab } = useTabsContext();
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

  if (variant === 'underline') {
    return (
      <div
        ref={listRef}
        className={cn(
          'relative flex border-b border-content-quaternary/20',
          className
        )}
        role="tablist"
      >
        {children}
        <div
          className={cn(
            'absolute bottom-0 h-0.5 bg-apple-blue',
            'transition-all duration-250 ease-apple'
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
        className={cn('flex gap-1', className)}
        role="tablist"
      >
        {children}
      </div>
    );
  }

  // Default: Segmented control style
  return (
    <div
      ref={listRef}
      className={cn(
        'relative inline-flex',
        'p-1 rounded-[0.875rem]',
        'bg-surface-tertiary',
        className
      )}
      role="tablist"
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          'absolute top-1 h-[calc(100%-0.5rem)]',
          'bg-surface-primary shadow-apple-sm rounded-[0.625rem]',
          'transition-all duration-250 ease-apple'
        )}
        style={indicatorStyle}
      />

      {children}
    </div>
  );
}

/* =============================================================================
   TabsTrigger
   ============================================================================= */

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      data-tab-id={value}
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative z-10',
        'px-4 py-2',
        'text-sm font-medium',
        'rounded-[0.625rem]',
        'transition-colors duration-200 ease-apple',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'text-content-primary'
          : 'text-content-secondary hover:text-content-primary',
        className
      )}
    >
      {children}
    </button>
  );
}

/* =============================================================================
   TabsContent
   ============================================================================= */

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
}
