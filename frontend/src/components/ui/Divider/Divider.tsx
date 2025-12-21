import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'full' | 'inset' | 'middle';
  label?: string;
}

/**
 * Layer 3: UI Component - Divider
 * Follows Apple aesthetic for subtle layout separation.
 */
export const Divider = memo(function Divider({
  orientation = 'horizontal',
  variant = 'full',
  label,
  className = '',
  style,
  ...props
}: DividerProps) {
  const theme = useAtomValue(themeAtom);
  const isHorizontal = orientation === 'horizontal';

  const colorClass = theme === 'dark' ? 'bg-white/10' : 'bg-black/5';

  const variantClasses = {
    full: '',
    inset: isHorizontal ? 'mx-4' : 'my-4',
    middle: isHorizontal ? 'mx-8' : 'my-8',
  };

  if (label && isHorizontal) {
    return (
      <div
        style={style}
        className={cn('flex items-center gap-4', variantClasses[variant], className)}
        role="separator"
        {...props}
      >
        <div className={cn('flex-1 h-[1px]', colorClass)} />
        <span className={cn(
          'text-[13px] font-semibold select-none',
          theme === 'dark' ? 'text-white/40' : 'text-black/40'
        )}>
          {label}
        </span>
        <div className={cn('flex-1 h-[1px]', colorClass)} />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn(
        'border-0 shrink-0',
        isHorizontal
          ? `w-full h-[1px] ${colorClass}`
          : `h-full w-[1px] ${colorClass}`,
        variantClasses[variant],
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
});
