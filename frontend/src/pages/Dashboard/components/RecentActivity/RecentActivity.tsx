import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import type { RecentActivityProps } from '../../types';

export function RecentActivity({ activities }: RecentActivityProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border-black/[0.05] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div className={cn(
      'p-6 rounded-[2.2rem] h-full transition-all duration-300',
      glassClasses
    )}>
      <h3 className={cn(
        'text-lg font-semibold mb-6',
        isDark ? 'text-white' : 'text-black'
      )}>
        Recent Activity
      </h3>
      
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={cn(
          'p-4 rounded-full mb-4',
          isDark ? 'bg-white/5' : 'bg-black/5'
        )}>
          <svg className={cn(
            'w-8 h-8',
            isDark ? 'text-white/20' : 'text-black/20'
          )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className={cn(
          'text-sm font-medium',
          isDark ? 'text-white/40' : 'text-black/40'
        )}>
          No recent activity to display
        </p>
      </div>
    </div>
  );
}

