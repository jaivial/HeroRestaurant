import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    default: {
      bg: 'bg-surface-tertiary',
      text: 'text-content-primary',
      dot: 'bg-content-tertiary',
    },
    success: {
      bg: 'bg-apple-green/15',
      text: 'text-apple-green',
      dot: 'bg-apple-green',
    },
    warning: {
      bg: 'bg-apple-orange/15',
      text: 'text-apple-orange',
      dot: 'bg-apple-orange',
    },
    error: {
      bg: 'bg-apple-red/15',
      text: 'text-apple-red',
      dot: 'bg-apple-red',
    },
    info: {
      bg: 'bg-apple-blue/15',
      text: 'text-apple-blue',
      dot: 'bg-apple-blue',
    },
  };

  const sizeClasses: Record<BadgeSize, { container: string; dot: string; icon: string }> = {
    sm: {
      container: 'px-2 py-0.5 text-xs gap-1',
      dot: 'w-1.5 h-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-2.5 py-1 text-sm gap-1.5',
      dot: 'w-2 h-2',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      container: 'px-3 py-1.5 text-base gap-2',
      dot: 'w-2.5 h-2.5',
      icon: 'w-4 h-4',
    },
  };

  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-medium rounded-full',
        sizes.container,
        styles.bg,
        styles.text,
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('rounded-full flex-shrink-0', sizes.dot, styles.dot)} />
      )}
      {icon && (
        <span className={cn('flex-shrink-0', sizes.icon)}>{icon}</span>
      )}
      {children}
    </span>
  );
}

/* =============================================================================
   Status Badge (Predefined variants for common use cases)
   ============================================================================= */

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
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
}
