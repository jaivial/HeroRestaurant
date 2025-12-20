import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

type IconButtonVariant = 'default' | 'ghost' | 'tinted' | 'filled';
type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonColor = 'default' | 'blue' | 'green' | 'red' | 'orange';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: IconButtonColor;
  rounded?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  color = 'default',
  rounded = true,
  loading = false,
  label,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;

  const sizeClasses: Record<IconButtonSize, { container: string; icon: string }> = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  };

  const colorConfig: Record<
    IconButtonColor,
    {
      default: string;
      ghost: string;
      tinted: string;
      filled: string;
    }
  > = {
    default: {
      default: 'bg-surface-tertiary text-content-primary hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800',
      ghost: 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary',
      tinted: 'bg-apple-gray-300/50 dark:bg-apple-gray-700/50 text-content-primary hover:bg-apple-gray-300 dark:hover:bg-apple-gray-700',
      filled: 'bg-surface-tertiary text-content-primary hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800',
    },
    blue: {
      default: 'bg-apple-blue/15 text-apple-blue hover:bg-apple-blue/25',
      ghost: 'text-apple-blue hover:bg-apple-blue/10',
      tinted: 'bg-apple-blue/20 text-apple-blue hover:bg-apple-blue/30',
      filled: 'bg-apple-blue text-white hover:bg-apple-blue-hover',
    },
    green: {
      default: 'bg-apple-green/15 text-apple-green hover:bg-apple-green/25',
      ghost: 'text-apple-green hover:bg-apple-green/10',
      tinted: 'bg-apple-green/20 text-apple-green hover:bg-apple-green/30',
      filled: 'bg-apple-green text-white hover:bg-apple-green-hover',
    },
    red: {
      default: 'bg-apple-red/15 text-apple-red hover:bg-apple-red/25',
      ghost: 'text-apple-red hover:bg-apple-red/10',
      tinted: 'bg-apple-red/20 text-apple-red hover:bg-apple-red/30',
      filled: 'bg-apple-red text-white hover:bg-apple-red-hover',
    },
    orange: {
      default: 'bg-apple-orange/15 text-apple-orange hover:bg-apple-orange/25',
      ghost: 'text-apple-orange hover:bg-apple-orange/10',
      tinted: 'bg-apple-orange/20 text-apple-orange hover:bg-apple-orange/30',
      filled: 'bg-apple-orange text-white hover:bg-apple-orange/90',
    },
  };

  const sizes = sizeClasses[size];
  const colorStyles = colorConfig[color][variant];

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        sizes.container,
        rounded ? 'rounded-full' : 'rounded-[0.5rem]',
        'transition-all duration-200 ease-apple',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
        'active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        colorStyles,
        className
      )}
      {...props}
    >
      {loading ? (
        <svg
          className={cn('animate-spin', sizes.icon)}
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
        <span className={sizes.icon}>{icon}</span>
      )}
    </button>
  );
}
