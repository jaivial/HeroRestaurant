import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

/* =============================================================================
   DropdownMenu Component
   ============================================================================= */

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - DropdownMenu
 * Apple-aesthetic dropdown with glass effect and smooth animations
 */
export const DropdownMenu = memo(function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className = '',
  style,
}: DropdownMenuProps) {
  const theme = useAtomValue(themeAtom);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const menuClasses = cn(
    // Base classes
    'absolute top-full mt-2 min-w-[200px] rounded-[1.5rem] overflow-hidden',
    'backdrop-blur-[20px] saturate-[180%]',
    'border transition-all duration-200 ease-out',
    'z-50',
    // Theme-aware glass effect
    theme === 'dark'
      ? 'bg-black/75 border-white/20 shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]'
      : 'bg-white/90 border-white/[0.25] shadow-[0_12px_40px_0_rgba(31,38,135,0.15)]',
    // Align
    align === 'right' ? 'right-0' : 'left-0',
    // Animation states
    isOpen
      ? 'opacity-100 scale-100 translate-y-0'
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
    className
  );

  return (
    <div ref={dropdownRef} className="relative inline-block" style={style}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      <div className={menuClasses}>
        <div className="py-2" onClick={handleClose}>
          {children}
        </div>
      </div>
    </div>
  );
});

/* =============================================================================
   DropdownMenuItem Component
   ============================================================================= */

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - DropdownMenuItem
 * Individual menu item with icon support and variants
 */
export const DropdownMenuItem = memo(function DropdownMenuItem({
  children,
  onClick,
  variant = 'default',
  icon,
  disabled = false,
  className = '',
  style,
}: DropdownMenuItemProps) {
  const theme = useAtomValue(themeAtom);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      onClick?.();
    },
    [disabled, onClick]
  );

  const variantClasses = {
    default:
      theme === 'dark'
        ? 'text-white hover:bg-white/10'
        : 'text-black hover:bg-black/5',
    danger:
      theme === 'dark'
        ? 'text-[#FF453A] hover:bg-[#FF453A]/10'
        : 'text-[#FF3B30] hover:bg-[#FF3B30]/5',
  };

  const itemClasses = cn(
    // Base classes
    'flex items-center gap-3 px-4 py-3',
    'min-h-[44px] w-full text-left',
    'text-[15px] font-medium leading-tight',
    'transition-all duration-150 ease-out',
    'cursor-pointer select-none',
    // Variant
    variantClasses[variant],
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
    className
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={itemClasses}
      style={style}
    >
      {icon && <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
});

/* =============================================================================
   DropdownMenuSeparator Component
   ============================================================================= */

interface DropdownMenuSeparatorProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - DropdownMenuSeparator
 * Visual separator between menu items
 */
export const DropdownMenuSeparator = memo(function DropdownMenuSeparator({
  className = '',
  style,
}: DropdownMenuSeparatorProps) {
  const theme = useAtomValue(themeAtom);

  const separatorClasses = cn(
    'h-px my-2 mx-4',
    theme === 'dark' ? 'bg-white/10' : 'bg-black/5',
    className
  );

  return <div className={separatorClasses} style={style} />;
});
