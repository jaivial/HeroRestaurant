import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Layer 3: UI Component - Badge
 * Follows Apple aesthetic for status indicators and labels.
 */
export const Badge = memo(function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const theme = useAtomValue(themeAtom);

  const variantClasses: Record<BadgeVariant, string> = {
    default: theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
    secondary: theme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-black/[0.03] text-black/60',
    success: theme === 'dark' ? 'bg-[#30D158]/15 text-[#30D158]' : 'bg-[#34C759]/15 text-[#34C759]',
    warning: theme === 'dark' ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]' : 'bg-[#FF9500]/15 text-[#FF9500]',
    error: theme === 'dark' ? 'bg-[#FF453A]/15 text-[#FF453A]' : 'bg-[#FF3B30]/15 text-[#FF3B30]',
    info: theme === 'dark' ? 'bg-[#0A84FF]/15 text-[#0A84FF]' : 'bg-[#007AFF]/15 text-[#007AFF]',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: theme === 'dark' ? 'bg-white/40' : 'bg-black/40',
    secondary: theme === 'dark' ? 'bg-white/20' : 'bg-black/20',
    success: theme === 'dark' ? 'bg-[#30D158]' : 'bg-[#34C759]',
    warning: theme === 'dark' ? 'bg-[#FF9F0A]' : 'bg-[#FF9500]',
    error: theme === 'dark' ? 'bg-[#FF453A]' : 'bg-[#FF3B30]',
    info: theme === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#007AFF]',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-[13px] gap-1.5',
    lg: 'px-3 py-1.5 text-[15px] gap-2',
  };

  const dotSizeClasses: Record<BadgeSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      style={style}
      className={cn(
        'inline-flex items-center font-semibold rounded-full select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('rounded-full flex-shrink-0', dotSizeClasses[size], dotColors[variant])} />
      )}
      {icon && (
        <span className="flex-shrink-0 opacity-80">{icon}</span>
      )}
      {children}
    </span>
  );
});

/* =============================================================================
   Status Badge (Predefined variants for common use cases)
   ============================================================================= */

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

export const StatusBadge = memo(function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const statusConfig: Record<
    StatusBadgeProps['status'],
    { variant: BadgeVariant; label: string }
  > = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    error: { variant: 'error', label: 'Error' },
    success: { variant: 'success', label: 'Success' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot {...props}>
      {children || config.label}
    </Badge>
  );
});
