import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  total?: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

/**
 * Layer 3: UI Component - StatCard
 * Displays a metric with an icon and optional trend information.
 */
export const StatCard = memo(({
  title,
  value,
  total,
  icon,
  isLoading,
  className,
  style,
  trend,
}: StatCardProps) => {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <Card 
      className={cn("p-6 flex flex-col justify-between h-full", className)}
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <Text variant="caption" color="secondary" weight="semibold" className="uppercase tracking-wider">
            {title}
          </Text>
          <div className="flex items-baseline gap-2">
            <Text variant="largeTitle" weight="bold">
              {isLoading ? '...' : value}
            </Text>
            {total !== undefined && (
              <Text variant="body" color="tertiary">/ {total}</Text>
            )}
          </div>
        </div>
        
        {icon && (
          <div className={cn(
            "p-2.5 rounded-[1rem] flex items-center justify-center",
            isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
          )}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-auto">
          <span className={cn(
            "text-[13px] font-bold px-1.5 py-0.5 rounded-md",
            trend.isPositive 
              ? (isDark ? "bg-[#30D158]/20 text-[#30D158]" : "bg-[#34C759]/10 text-[#34C759]")
              : (isDark ? "bg-[#FF453A]/20 text-[#FF453A]" : "bg-[#FF3B30]/10 text-[#FF3B30]")
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <Text variant="caption" color="tertiary">
            {trend.label}
          </Text>
        </div>
      )}
    </Card>
  );
});

StatCard.displayName = 'StatCard';

