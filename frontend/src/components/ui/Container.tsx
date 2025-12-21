import React, { memo } from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  fluid?: boolean;
  children?: React.ReactNode;
}

/**
 * Layer 3: UI Component - Container
 * Follows the 11-level breakpoint system defined in styling.md
 */
export const Container = memo(function Container({ 
  className = '', 
  style, 
  fluid = false, 
  children, 
  ...props 
}: ContainerProps) {
  const baseClasses = fluid 
    ? 'w-full px-4 min-[200px]:px-2 min-[280px]:px-4 min-[360px]:px-6 min-[480px]:px-8'
    : cn(
        'w-full px-4 mx-auto',
        'min-[200px]:px-2',
        'min-[280px]:px-4',
        'min-[360px]:px-6',
        'min-[480px]:px-8',
        'min-[640px]:max-w-2xl',
        'min-[768px]:max-w-3xl',
        'min-[1024px]:max-w-4xl',
        'min-[1280px]:max-w-5xl',
        'min-[1536px]:max-w-6xl',
        'min-[2048px]:max-w-7xl',
        'min-[3000px]:max-w-[1800px]'
      );

  return (
    <div
      style={style}
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});
