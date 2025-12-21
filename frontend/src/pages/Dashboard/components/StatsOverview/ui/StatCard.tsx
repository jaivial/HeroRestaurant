import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import type { StatCardProps } from '../../../types';

export function StatCard({ label, value, icon, color }: StatCardProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/85 border-black/[0.08] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.04)]';

  const colorStyles = {
    blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
    green: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600',
    orange: isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={cn(
      'p-6 rounded-[2.2rem] flex items-center justify-between transition-all duration-300',
      glassClasses
    )}>
      <div>
        <p className={cn(
          'text-sm font-medium',
          isDark ? 'text-white/40' : 'text-black/40'
        )}>
          {label}
        </p>
        <p className={cn(
          'text-3xl font-bold mt-2',
          isDark ? 'text-white' : 'text-black'
        )}>
          {value}
        </p>
      </div>
      <div className={cn(
        'p-3 rounded-[1rem] shrink-0',
        colorStyles[color]
      )}>
        {icon}
      </div>
    </div>
  );
}

