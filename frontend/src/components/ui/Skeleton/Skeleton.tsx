import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Layer 3: UI Component - Skeleton
 * Follows Apple aesthetic with subtle pulsing animation.
 */
export const Skeleton = memo(function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style: customStyle,
}: SkeletonProps) {
  const theme = useAtomValue(themeAtom);

  const baseClasses = cn(
    'animate-pulse relative overflow-hidden',
    theme === 'dark' ? 'bg-white/10' : 'bg-black/5',
    'after:absolute after:inset-0',
    'after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent',
    'after:animate-shimmer'
  );

  const variantClasses = {
    text: 'h-4 rounded-[4px]',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-[1rem]',
  };

  const style = {
    ...customStyle,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-3', className)} style={customStyle}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 && 'w-[75%]'
            )}
            style={index !== lines - 1 ? { width: style.width } : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  );
});

/* =============================================================================
   Skeleton Presets
   ============================================================================= */

interface SkeletonCardProps {
  hasImage?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonCard = memo(function SkeletonCard({ 
  hasImage = true, 
  className = '',
  style 
}: SkeletonCardProps) {
  const theme = useAtomValue(themeAtom);
  
  return (
    <div 
      style={style}
      className={cn(
        'rounded-[2.2rem] p-8 border',
        theme === 'dark' ? 'bg-black/50 border-white/10' : 'bg-white/72 border-white/[0.18]',
        className
      )}
    >
      {hasImage && (
        <Skeleton variant="rounded" className="w-full h-48 mb-6" />
      )}
      <Skeleton variant="text" className="w-[70%] mb-4 h-6" />
      <Skeleton variant="text" lines={2} className="mb-6" />
      <div className="flex gap-4">
        <Skeleton variant="rounded" className="w-24 h-11" />
        <Skeleton variant="rounded" className="w-24 h-11" />
      </div>
    </div>
  );
});

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonAvatar = memo(function SkeletonAvatar({ 
  size = 'md', 
  withText = false, 
  className = '',
  style 
}: SkeletonAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('flex items-center gap-4', className)} style={style}>
      <Skeleton variant="circular" className={sizes[size]} />
      {withText && (
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 mb-2 h-4" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      )}
    </div>
  );
});

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonTable = memo(function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className = '',
  style 
}: SkeletonTableProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div className={cn('space-y-4', className)} style={style}>
      {/* Header */}
      <div className={cn(
        'flex gap-6 pb-4 border-b',
        theme === 'dark' ? 'border-white/10' : 'border-black/5'
      )}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1 h-5" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-6 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
});
