import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { useDashboardData } from './hooks/useDashboardData';
import { StatsOverview } from './components/StatsOverview/StatsOverview';
import { RecentActivity } from './components/RecentActivity/RecentActivity';
import { QuickActions } from './components/QuickActions/QuickActions';
import { cn } from '@/utils/cn';

export function Dashboard() {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const { stats, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className={cn(
          'p-12 rounded-[2.2rem] backdrop-blur-[20px] saturate-[180%] transition-all duration-350',
          isDark 
            ? 'bg-black/50 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
            : 'bg-white/72 border-black/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
        )}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-[1280px]:space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className={cn(
          'text-3xl font-bold transition-colors duration-300',
          isDark ? 'text-white' : 'text-black'
        )}>
          Dashboard
        </h1>
        <p className={cn(
          'mt-1 transition-colors duration-300',
          isDark ? 'text-white/40' : 'text-black/40'
        )}>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Layer */}
      <StatsOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 min-[1024px]:grid-cols-2 gap-6 min-[1280px]:gap-8">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
