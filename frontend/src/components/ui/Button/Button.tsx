import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'danger' | 'primary' | 'secondary' | 'ghost' | 'error' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Button
 * Follows Apple standard button configurations and aesthetic.
 */
export const Button = memo(function Button({
  variant = 'filled',
  size = 'md',
  loading = false,
  children,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const theme = useAtomValue(themeAtom);
  const isDisabled = disabled || loading;

  const buttonBase = "inline-flex items-center justify-center gap-2 rounded-[1rem] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeClasses = {
    sm: "h-[32px] px-3 text-[14px]",
    md: "h-[44px] px-6 text-[17px]",
    lg: "h-[54px] px-8 text-[20px]",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    filled: theme === 'dark' ? 'bg-[#0A84FF] text-white' : 'bg-[#007AFF] text-white',
    primary: theme === 'dark' ? 'bg-[#0A84FF] text-white' : 'bg-[#007AFF] text-white',
    tinted: theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]',
    secondary: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
    gray: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
    plain: 'bg-transparent text-[#007AFF]',
    ghost: 'bg-transparent text-[#007AFF]',
    danger: theme === 'dark' ? 'bg-[#FF453A] text-white' : 'bg-[#FF3B30] text-white',
    error: theme === 'dark' ? 'bg-[#FF453A] text-white' : 'bg-[#FF3B30] text-white',
    glass: theme === 'dark' ? 'bg-white/10 border-white/10 text-white backdrop-blur-md' : 'bg-black/5 border-black/5 text-black backdrop-blur-md',
  };

  return (
    <button
      style={style}
      className={cn(buttonBase, sizeClasses[size], variantClasses[variant], className)}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {children}
    </button>
  );
});
