import type { HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'full' | 'inset' | 'middle';
  label?: string;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'full',
  label,
  className,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  const variantClasses = {
    full: '',
    inset: isHorizontal ? 'mx-4' : 'my-4',
    middle: isHorizontal ? 'mx-8' : 'my-8',
  };

  // Divider with label
  if (label && isHorizontal) {
    return (
      <div
        className={cn('flex items-center gap-4', variantClasses[variant], className)}
        role="separator"
        {...props}
      >
        <div className="flex-1 h-px bg-content-quaternary/20" />
        <span className="text-sm text-content-tertiary font-medium">{label}</span>
        <div className="flex-1 h-px bg-content-quaternary/20" />
      </div>
    );
  }

  return (
    <hr
      className={cn(
        'border-0',
        isHorizontal
          ? 'w-full h-px bg-content-quaternary/20'
          : 'h-full w-px bg-content-quaternary/20',
        variantClasses[variant],
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}
