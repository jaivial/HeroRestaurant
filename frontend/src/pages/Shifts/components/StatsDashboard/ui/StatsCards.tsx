// frontend/src/pages/Shifts/components/StatsDashboard/ui/StatsCards.tsx

import { memo } from 'react';
import { Card, Text, Badge } from '@/components/ui';
import { Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardsProps {
  isDark: boolean;
  hoursWorked: string;
  hoursContracted: string;
  diff: string;
  isPositive: boolean;
  status: string;
}

export const StatsCards = memo(function StatsCards({
  isDark,
  hoursWorked,
  hoursContracted,
  diff,
  isPositive,
  status
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className={cn(
        "p-6 w-full min-w-0 max-w-md",
        isDark ? "bg-white/5" : "bg-white"
      )}>
        <div className="flex justify-between items-start mb-4">
          <Text className={cn(
            "text-[13px] font-bold uppercase tracking-wider",
            isDark ? "text-white/60" : "text-black/60"
          )}>Hours Worked</Text>
          <Clock size={18} className={isDark ? "text-white/40" : "text-black/40"} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-[34px] font-bold",
            isDark ? "text-white" : "text-black"
          )}>{hoursWorked}h</span>
          <span className={isDark ? "text-white/40 text-sm" : "text-black/40 text-sm"}>/ {hoursContracted}h</span>
        </div>
      </Card>

      <Card className={cn(
        "p-6 max-w-md",
        isDark ? "bg-white/5" : "bg-white"
      )}>
        <div className="flex justify-between items-start mb-4">
          <Text className={cn(
            "text-[13px] font-bold uppercase tracking-wider",
            isDark ? "text-white/60" : "text-black/60"
          )}>Bank Balance</Text>
          <TrendingUp size={18} className={isDark ? "text-white/40" : "text-black/40"} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-[34px] font-bold",
            isPositive 
              ? (isDark ? 'text-[#30D158]' : 'text-[#248A3D]') 
              : (isDark ? 'text-[#FF453A]' : 'text-[#FF3B30]')
          )}>
            {isPositive ? '+' : ''}{diff}h
          </span>
        </div>
      </Card>

      <Card className={cn(
        "p-6 sm:col-span-2 md:col-span-1 max-w-md",
        isDark ? "bg-white/5" : "bg-white"
      )}>
        <div className="flex justify-between items-start mb-4">
          <Text className={cn(
            "text-[13px] font-bold uppercase tracking-wider",
            isDark ? "text-white/60" : "text-black/60"
          )}>Status</Text>
          <ShieldCheck size={18} className={isDark ? "text-white/40" : "text-black/40"} />
        </div>
        <div>
          <Badge variant={status === 'healthy' ? 'success' : status === 'caution' ? 'info' : 'warning'} size="lg">
            {status.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </Card>
    </div>
  );
});
