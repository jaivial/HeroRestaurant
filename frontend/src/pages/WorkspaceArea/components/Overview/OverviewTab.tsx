import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { StatCard } from '@/components/ui/StatCard/StatCard';
import { cn } from '@/utils/cn';
import type { OverviewTabProps } from '../../types';

export const OverviewTab = memo(({ workspace, stats, isLoading }: OverviewTabProps) => {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  if (!workspace) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Menus"
          value={stats.activeMenus}
          total={stats.totalMenus}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          isLoading={isLoading}
          trend={{ value: 12, label: 'vs last month', isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value={stats.totalMembers}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          isLoading={isLoading}
          trend={{ value: 2, label: 'new this week', isPositive: true }}
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders ?? 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          isLoading={isLoading}
          trend={{ value: 5, label: 'increase', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className={cn(
            "h-32 w-full",
            isDark ? "bg-white/5" : "bg-black/5"
          )}>
            {workspace.coverUrl && (
              <img src={workspace.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
            )}
          </div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row gap-8 -mt-12">
              <div className={cn(
                "w-32 h-32 rounded-[2.2rem] flex-shrink-0 flex items-center justify-center overflow-hidden border-4",
                isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-black/5"
              )}>
                {workspace.logoUrl ? (
                  <img src={workspace.logoUrl} alt={workspace.name} className="w-full h-full object-cover" />
                ) : (
                  <Text variant="largeTitle" weight="bold" color="tertiary" className="opacity-20">{workspace.name[0]}</Text>
                )}
              </div>
              <div className="pt-14 md:pt-16 space-y-4 flex-1">
                <div>
                  <Text variant="title2" weight="bold">{workspace.name}</Text>
                  <Text variant="caption" color="secondary">@{workspace.slug}</Text>
                </div>
                
                <div className="space-y-4">
                  <Text variant="body" color="secondary" className="leading-relaxed">
                    {workspace.description || "No description provided for this workspace."}
                  </Text>
                  
                  <div className="grid grid-cols-2 gap-8 pt-2">
                    <div className="space-y-1">
                      <Text variant="caption" color="tertiary" weight="bold" className="uppercase tracking-wider">Currency</Text>
                      <Text weight="medium">{workspace.currency || 'USD'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text variant="caption" color="tertiary" weight="bold" className="uppercase tracking-wider">Timezone</Text>
                      <Text weight="medium">{workspace.timezone || 'UTC'}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h4">Workspace Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Text variant="caption" color="secondary">Profile Completion</Text>
                  <Text variant="caption" weight="bold">85%</Text>
                </div>
                <div className={cn(
                  "h-2 w-full rounded-full overflow-hidden",
                  isDark ? "bg-white/10" : "bg-black/5"
                )}>
                  <div className="h-full bg-[#30D158] w-[85%] rounded-full" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Text variant="caption" color="tertiary" weight="bold" className="uppercase tracking-wider">Quick Actions</Text>
                <div className="space-y-2">
                  <QuickActionButton icon="plus" label="Add Team Member" isDark={isDark} />
                  <QuickActionButton icon="menu" label="Create New Menu" isDark={isDark} />
                  <QuickActionButton icon="settings" label="Global Settings" isDark={isDark} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h4">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <ActivityItem 
                  title="Menu Updated" 
                  time="2 hours ago" 
                  user="Jaime" 
                  isDark={isDark} 
                />
                <ActivityItem 
                  title="New Member Joined" 
                  time="Yesterday" 
                  user="Alex" 
                  isDark={isDark} 
                />
                <ActivityItem 
                  title="Settings Changed" 
                  time="3 days ago" 
                  user="System" 
                  isDark={isDark} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

const QuickActionButton = ({ icon, label, isDark }: { icon: string; label: string; isDark: boolean }) => (
  <button className={cn(
    "w-full flex items-center gap-3 p-3 rounded-[1rem] transition-all active:scale-[0.98]",
    isDark ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"
  )}>
    <div className={cn(
      "p-1.5 rounded-lg",
      isDark ? "bg-white/10" : "bg-black/5"
    )}>
      {icon === 'plus' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {icon === 'menu' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
      {icon === 'settings' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </div>
    <Text variant="callout">{label}</Text>
  </button>
);

const ActivityItem = ({ title, time, user, isDark }: { title: string; time: string; user: string; isDark: boolean }) => (
  <div className="p-4 flex items-center gap-4">
    <div className={cn(
      "w-2 h-2 rounded-full",
      isDark ? "bg-[#0A84FF]" : "bg-[#007AFF]"
    )} />
    <div className="flex-1">
      <Text variant="callout" weight="semibold">{title}</Text>
      <Text variant="caption" color="secondary">{user} • {time}</Text>
    </div>
  </div>
);
