import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type IconButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'danger' | 'default' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: boolean;
  loading?: boolean;
  label?: string;
}

/**
 * Layer 3: UI Component - IconButton
 * Follows Apple aesthetic for compact action elements.
 */
export const IconButton = memo(function IconButton({
  icon,
  variant = 'gray',
  size = 'md',
  rounded = true,
  loading = false,
  label,
  className = '',
  style,
  disabled,
  ...props
}: IconButtonProps) {
  const theme = useAtomValue(themeAtom);
  const isDisabled = disabled || loading;

  const baseClasses = cn(
    'inline-flex items-center justify-center transition-all duration-200 active:scale-[0.90]',
    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    rounded ? 'rounded-full' : 'rounded-[1rem]'
  );

  const sizeClasses: Record<IconButtonSize, string> = {
    sm: 'w-[32px] h-[32px]',
    md: 'w-[44px] h-[44px]',
    lg: 'w-[54px] h-[54px]',
  };

  const iconSizeClasses: Record<IconButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses: Record<IconButtonVariant, string> = {
    filled: theme === 'dark' ? 'bg-[#0A84FF] text-white' : 'bg-[#007AFF] text-white',
    tinted: theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]',
    gray: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
    default: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
    plain: theme === 'dark' ? 'bg-transparent text-[#0A84FF]' : 'bg-transparent text-[#007AFF]',
    ghost: theme === 'dark' ? 'bg-transparent text-[#0A84FF]' : 'bg-transparent text-[#007AFF]',
    danger: theme === 'dark' ? 'bg-[#FF453A] text-white' : 'bg-[#FF3B30] text-white',
  };

  return (
    <button
      style={style}
      type="button"
      disabled={isDisabled}
      aria-label={label}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {loading ? (
        <svg
          className={cn('animate-spin', iconSizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span className={cn(iconSizeClasses[size], "flex items-center justify-center")}>{icon}</span>
      )}
    </button>
  );
});
