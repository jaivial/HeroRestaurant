// frontend/src/pages/Shifts/components/MemberAnalysis/ui/MemberAnalysisUI.tsx

import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Card, CardContent, Heading, Badge } from '@/components/ui';
import type { MemberAnalysisUIProps } from '../../../types';
import { TrendingUp, TrendingDown, Minus, Info, Zap } from 'lucide-react';

export const MemberAnalysisUI = memo(function MemberAnalysisUI({
  memberStats
}: MemberAnalysisUIProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  if (memberStats.length === 0) {
    return (
      <Card variant="subtle" className="p-12 text-center">
        <Text color="tertiary">Loading analysis data...</Text>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {memberStats.map((stat, index) => {
        const percentageOfAvg = stat.teamAvg === 0 ? 0 : (stat.value / stat.teamAvg) * 100;
        
        // Semantic system colors from styling.md
        const colors = {
          success: isDark ? '#30D158' : '#248A3D',
          error: isDark ? '#FF453A' : '#FF3B30',
          blue: isDark ? '#0A84FF' : '#007AFF',
          gray: '#8E8E93',
        };

        const trendColorKey = stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'error' : 'blue';
        const trendHex = colors[trendColorKey as keyof typeof colors];
        const badgeVariant = stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'error' : 'default';

        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <Text variant="caption" weight="bold" color="tertiary" className="uppercase tracking-[0.1em]">
                    {stat.label}
                  </Text>
                  <div className="flex items-baseline gap-1.5">
                    <Text variant="largeTitle" weight="bold" className="tracking-tight">
                      {stat.value.toFixed(1)}
                    </Text>
                    <Text variant="title3" color="tertiary" weight="medium" className="opacity-70">
                      {stat.unit}
                    </Text>
                  </div>
                </div>
                
                <Badge 
                  variant={badgeVariant}
                  size="lg"
                  className="px-4 py-2"
                  icon={stat.trend === 'up' ? <TrendingUp size={16} /> : stat.trend === 'down' ? <TrendingDown size={16} /> : <Minus size={16} />}
                >
                  {percentageOfAvg.toFixed(0)}% <span className="text-[11px] opacity-90 font-bold ml-1">AVG</span>
                </Badge>
              </div>

              <div className="flex-grow space-y-5 mb-8">
                <div className="relative pt-2">
                  <div className={
                    `h-3 w-full rounded-full overflow-hidden relative ${isDark ? 'bg-white/10' : 'bg-black/[0.06]'}`
                  }>
                    {/* Progress Fill */}
                    <div 
                      className="h-full transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      style={{ 
                        width: `${Math.min(100, percentageOfAvg)}%`,
                        backgroundColor: trendHex
                      }}
                    />
                    
                    {/* Glass Overlay for Progress */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Average Marker */}
                  <div 
                    className="absolute top-0 w-[3px] h-7 bg-[#007AFF] dark:bg-[#0A84FF] z-10 -mt-2 shadow-[0_0_10px_rgba(0,122,255,0.6)] rounded-full transition-all duration-300"
                    style={{ left: '100%' }}
                    title="Team Average"
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] ring-2 ring-white dark:ring-black" />
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <Text variant="caption2" color="tertiary" weight="bold" className="tracking-widest opacity-80 uppercase">You</Text>
                  <Text variant="caption2" color="blue" weight="bold" className="tracking-widest uppercase">Team Target</Text>
                </div>
              </div>

              <div className={`p-5 rounded-[1.2rem] transition-colors duration-200 border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-black/[0.03] border-black/[0.02]'} flex gap-4 items-center`}>
                <div className={`p-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <Info size={16} className={isDark ? 'text-white/60' : 'text-black/60'} />
                </div>
                <Text variant="callout" color="secondary" className="leading-snug opacity-90">
                  {stat.description}
                </Text>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="overflow-hidden relative group border-0 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-30 transition-all duration-700 group-hover:scale-125 ${isDark ? 'bg-[#0A84FF]' : 'bg-[#007AFF]'}`} />
        <div className={`absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-10 transition-all duration-700 group-hover:scale-110 ${isDark ? 'bg-[#30D158]' : 'bg-[#248A3D]'}`} />
        
        <CardContent className="p-10 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-[1.2rem] shadow-lg transition-transform duration-300 group-hover:rotate-6 ${isDark ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                  <Zap size={28} fill="currentColor" />
                </div>
                <Heading level={2} className="tracking-tight">Performance Insights</Heading>
              </div>
              
              <Text variant="body" color="secondary" className="max-w-2xl text-[18px] leading-relaxed opacity-90">
                Based on your recent activity, your scheduling alignment is <span className={`font-bold ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>15% better</span> than the department average. 
                Keep maintaining this consistency to optimize resource allocation and team workflow efficiency.
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
              {[
                { label: 'Reliability', value: 'A+', color: 'blue', desc: 'Consistency' },
                { label: 'Punctuality', value: '98%', color: 'green', desc: 'On-time' }
              ].map((metric, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center p-8 rounded-[2rem] min-w-[160px] border transition-all duration-300 hover:translate-y-[-4px] ${
                    isDark 
                      ? 'bg-white/[0.05] border-white/[0.08] shadow-[0_8px_16px_rgba(0,0,0,0.2)]' 
                      : 'bg-white/80 border-black/[0.03] shadow-[0_8px_16px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <Text variant="largeTitle" weight="bold" color={metric.color as any} className="mb-1">
                    {metric.value}
                  </Text>
                  <Text variant="caption" weight="bold" color="tertiary" className="uppercase tracking-[0.15em] text-[10px]">
                    {metric.label}
                  </Text>
                  <Text variant="caption2" color="quaternary" className="mt-1 font-medium">
                    {metric.desc}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

