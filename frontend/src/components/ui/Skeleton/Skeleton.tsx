import { cn } from '../../../utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-surface-tertiary',
    'animate-pulse',
    'relative overflow-hidden',
    // Shimmer effect overlay
    'after:absolute after:inset-0',
    'after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent',
    'after:animate-shimmer'
  );

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-[0.875rem]',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              // Make last line shorter
              index === lines - 1 && 'w-3/4'
            )}
            style={index !== lines - 1 ? style : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

/* =============================================================================
   Skeleton Presets
   ============================================================================= */

interface SkeletonCardProps {
  hasImage?: boolean;
  className?: string;
}

export function SkeletonCard({ hasImage = true, className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-surface-secondary rounded-2xl p-5', className)}>
      {hasImage && (
        <Skeleton variant="rounded" className="w-full h-40 mb-4" />
      )}
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="text" lines={2} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="w-20 h-8" />
        <Skeleton variant="rounded" className="w-20 h-8" />
      </div>
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

export function SkeletonAvatar({ size = 'md', withText = false, className }: SkeletonAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton variant="circular" className={sizes[size]} />
      {withText && (
        <div className="flex-1">
          <Skeleton variant="text" className="w-24 mb-1" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      )}
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-content-quaternary/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1 h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
