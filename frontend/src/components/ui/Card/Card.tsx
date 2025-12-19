import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

/* =============================================================================
   Card Component
   ============================================================================= */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  hoverable?: boolean;
  children: ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  hoverable = false,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-apple',
        'transition-all duration-250 ease-apple',

        // Variant styles
        {
          // Default - Solid background
          'bg-surface-secondary': variant === 'default',

          // Elevated - With shadow
          'bg-surface-primary shadow-apple-lg': variant === 'elevated',

          // Glass - Frosted glass effect
          'glass': variant === 'glass',

          // Outlined - Border only
          'bg-transparent border border-content-quaternary/20': variant === 'outlined',
        },

        // Hoverable effect
        hoverable && [
          'cursor-pointer',
          'hover:shadow-apple-xl hover:-translate-y-0.5',
          'active:scale-[0.99] active:shadow-apple-md',
        ],

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* =============================================================================
   CardHeader Component
   ============================================================================= */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-5 py-4',
        'border-b border-content-quaternary/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* =============================================================================
   CardTitle Component
   ============================================================================= */

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
  children,
  className,
  as: Component = 'h3',
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-lg font-semibold',
        'text-content-primary',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/* =============================================================================
   CardContent Component
   ============================================================================= */

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardContent({
  children,
  className,
  noPadding = false,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(!noPadding && 'p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* =============================================================================
   CardFooter Component
   ============================================================================= */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'px-5 py-4',
        'border-t border-content-quaternary/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
