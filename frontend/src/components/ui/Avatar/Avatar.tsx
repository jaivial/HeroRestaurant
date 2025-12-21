import React, { useState, memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  rounded?: boolean;
  imgClassName?: string;
}

/**
 * Layer 3: UI Component - Avatar
 * Follows Apple aesthetic for user profiles and identities.
 */
export const Avatar = memo(function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  rounded = true,
  className = '',
  style,
  imgClassName = '',
  ...props
}: AvatarProps) {
  const theme = useAtomValue(themeAtom);
  const [imageError, setImageError] = useState(false);

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-11 h-11 text-[15px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-18 h-18 text-[22px]',
    '2xl': 'w-24 h-24 text-[28px]',
  };

  const statusSizeClasses: Record<AvatarSize, string> = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6',
  };

  const statusColors: Record<AvatarStatus, string> = {
    online: theme === 'dark' ? 'bg-[#30D158]' : 'bg-[#34C759]',
    offline: theme === 'dark' ? 'bg-white/20' : 'bg-black/20',
    busy: theme === 'dark' ? 'bg-[#FF453A]' : 'bg-[#FF3B30]',
    away: theme === 'dark' ? 'bg-[#FF9F0A]' : 'bg-[#FF9500]',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const showFallback = !src || imageError;

  return (
    <div 
      className={cn(
        'relative inline-flex flex-shrink-0', 
        rounded ? 'rounded-full' : 'rounded-[1rem]',
        className
      )} 
      style={style}
    >
      <div
        className={cn(
          sizeClasses[size],
          rounded ? 'rounded-full' : 'rounded-[1rem]',
          theme === 'dark' ? 'bg-white/10' : 'bg-black/5',
          'flex items-center justify-center overflow-hidden'
        )}
      >
        {showFallback ? (
          <span
            className={cn(
              'font-bold select-none',
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
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
            {...props}
          />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            statusSizeClasses[size],
            'rounded-full border-2',
            theme === 'dark' ? 'border-black' : 'border-white',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
});

/* =============================================================================
   AvatarGroup Component
   ============================================================================= */

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
}

export const AvatarGroup = memo(function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  className = '',
  style,
  ...props
}: AvatarGroupProps) {
  const theme = useAtomValue(themeAtom);
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapClasses: Record<AvatarSize, string> = {
    xs: '-ml-2',
    sm: '-ml-3',
    md: '-ml-4',
    lg: '-ml-5',
    xl: '-ml-6',
    '2xl': '-ml-8',
  };

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-11 h-11 text-[15px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-18 h-18 text-[22px]',
    '2xl': 'w-24 h-24 text-[28px]',
  };

  return (
    <div className={cn('flex items-center', className)} style={style} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'relative rounded-full border-2',
            theme === 'dark' ? 'border-black' : 'border-white',
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
            'rounded-full border-2 flex items-center justify-center font-bold select-none',
            theme === 'dark' ? 'bg-white/10 text-white/60 border-black' : 'bg-black/5 text-black/60 border-white'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
});
