import { Text, Badge } from '@/components/ui';
import { Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MemberShiftStats } from '../../../types';

interface ShiftStatsCardsProps {
  stats: MemberShiftStats | null;
  isDark: boolean;
}

export function ShiftStatsCards({ stats, isDark }: ShiftStatsCardsProps) {
  const hoursWorked = stats ? (stats.workedMinutes / 60).toFixed(1) : '0.0';
  const hoursContracted = stats ? (stats.contractedMinutes / 60).toFixed(1) : '0.0';
  const diff = stats ? (stats.differenceMinutes / 60).toFixed(1) : '0.0';
  const isPositive = stats ? stats.differenceMinutes >= 0 : true;

  // Glass Effect styles (matching MemberDetailModal)
  const glassBase = "backdrop-blur-[20px] saturate-[180%]";
  const surfaceCard = cn(
    'p-6 rounded-[1.2rem] border transition-all duration-200',
    glassBase,
    isDark 
      ? 'bg-[#1C1C1E]/80 border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4)]' 
      : 'bg-white/70 border-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div className={surfaceCard}>
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
      </div>

      <div className={surfaceCard}>
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
              ? (isDark ? 'text-[#28A745]' : 'text-[#1E7E34]') 
              : (isDark ? 'text-[#FF453A]' : 'text-[#FF3B30]')
          )}>
            {isPositive ? '+' : ''}{diff}h
          </span>
        </div>
      </div>

      <div className={cn(surfaceCard, "sm:col-span-2 md:col-span-1")}>
        <div className="flex justify-between items-start mb-4">
          <Text className={cn(
            "text-[13px] font-bold uppercase tracking-wider",
            isDark ? "text-white/60" : "text-black/60"
          )}>Status</Text>
          <ShieldCheck size={18} className={isDark ? "text-white/40" : "text-black/40"} />
        </div>
        <div>
          <Badge variant={stats?.status === 'healthy' ? 'success' : stats?.status === 'caution' ? 'info' : 'warning'} size="lg">
            {stats?.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
