import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

/* =============================================================================
   Card Component
   ============================================================================= */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'solid' | 'outlined';
  hoverable?: boolean;
  children: React.ReactNode;
}

/**
 * Layer 3: UI Component - Card
 * Implements the Liquid Glass effect with Apple aesthetic.
 */
export const Card = memo(function Card({
  variant = 'default',
  hoverable = false,
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const theme = useAtomValue(themeAtom);

  const baseClasses = "backdrop-blur-[20px] saturate-[180%] rounded-[2.2rem] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

  const variantClasses = {
    default: theme === 'dark' ? 'bg-black/50 border-white/10' : 'bg-white/85 border-black/[0.08]',
    subtle: theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-white/60 border-black/[0.06]',
    solid: theme === 'dark' ? 'bg-black/75 border-white/20' : 'bg-white/95 border-black/[0.12]',
    outlined: 'bg-transparent border-black/10 dark:border-white/10',
  };

  const shadowClass = theme === 'dark'
    ? 'shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
    : 'shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]';

  const hoverClasses = hoverable 
    ? "cursor-pointer hover:scale-[1.01] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] active:scale-[0.99]" 
    : "";

  return (
    <div
      style={style}
      className={cn(
        baseClasses,
        variantClasses[variant],
        shadowClass,
        hoverClasses,
        'border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/* =============================================================================
   CardHeader Component
   ============================================================================= */

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = memo(function CardHeader({ 
  children, 
  className = '', 
  style, 
  ...props 
}: CardHeaderProps) {
  const theme = useAtomValue(themeAtom);
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/[0.08]';

  return (
    <div
      style={style}
      className={cn(
        'flex items-center justify-between',
        'px-8 py-5',
        'border-b',
        borderColor,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/* =============================================================================
   CardTitle Component
   ============================================================================= */

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = memo(function CardTitle({
  children,
  className = '',
  style,
  as: Component = 'h3',
  ...props
}: CardTitleProps) {
  return (
    <Component
      style={style}
      className={cn(
        'text-[22px] font-semibold leading-normal',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

/* =============================================================================
   CardContent Component
   ============================================================================= */

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const CardContent = memo(function CardContent({
  children,
  className = '',
  style,
  noPadding = false,
  ...props
}: CardContentProps) {
  return (
    <div
      style={style}
      className={cn(!noPadding && 'p-8', className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* =============================================================================
   CardFooter Component
   ============================================================================= */

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = memo(function CardFooter({ 
  children, 
  className = '', 
  style, 
  ...props 
}: CardFooterProps) {
  const theme = useAtomValue(themeAtom);
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/[0.08]';

  return (
    <div
      style={style}
      className={cn(
        'flex items-center justify-end gap-4',
        'px-8 py-5',
        'border-t',
        borderColor,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
