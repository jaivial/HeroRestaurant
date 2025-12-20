import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  rounded?: boolean;
  className?: string;
  imgClassName?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  rounded = true,
  className,
  imgClassName,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
    xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-2 h-2 border' },
    sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2.5 h-2.5 border' },
    md: { container: 'w-10 h-10', text: 'text-base', status: 'w-3 h-3 border-2' },
    lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3.5 h-3.5 border-2' },
    xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4 border-2' },
    '2xl': { container: 'w-20 h-20', text: 'text-2xl', status: 'w-5 h-5 border-2' },
  };

  const statusColors: Record<AvatarStatus, string> = {
    online: 'bg-apple-green',
    offline: 'bg-apple-gray-400',
    busy: 'bg-apple-red',
    away: 'bg-apple-orange',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizes = sizeClasses[size];
  const showFallback = !src || imageError;

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        className={cn(
          sizes.container,
          rounded ? 'rounded-full' : 'rounded-[0.875rem]',
          'bg-surface-tertiary',
          'flex items-center justify-center',
          'shadow-apple-sm',
          !rounded && 'overflow-hidden'
        )}
      >
        {showFallback ? (
          <span
            className={cn(
              sizes.text,
              'font-semibold text-content-secondary',
              'select-none'
            )}
          >
            {name ? getInitials(name) : '?'}
          </span>
        ) : (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className={cn("w-full h-full object-cover", imgClassName)}
            {...(props as any)}
          />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            sizes.status,
            'rounded-full',
            'border-2 border-surface-primary',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

/* =============================================================================
   AvatarGroup Component
   ============================================================================= */

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapClasses: Record<AvatarSize, string> = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
    '2xl': '-ml-6',
  };

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-surface-primary rounded-full',
            index > 0 && overlapClasses[size]
          )}
        >
          {avatar}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            overlapClasses[size],
            sizeClasses[size],
            'rounded-full',
            'bg-surface-tertiary',
            'flex items-center justify-center',
            'font-medium text-content-secondary',
            'ring-2 ring-surface-primary'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
