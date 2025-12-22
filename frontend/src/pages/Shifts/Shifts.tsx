// frontend/src/pages/Shifts/Shifts.tsx

import { useEffect, useState } from 'react';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { workspaceIdAtom } from '@/atoms/workspaceAtoms';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { fetchPreferencesAtom } from '@/atoms/preferenceAtoms';
import { Container, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ClockSection } from './components/ClockSection';
import { StatsDashboard } from './components/StatsDashboard';
import { TeamStats } from './components/TeamStats';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/utils/permissions';

export function Shifts() {
  const restaurantId = useAtomValue(workspaceIdAtom);
  const theme = useAtomValue(themeAtom);
  const [timeFormat, setTimeFormat] = useAtom(timeFormatAtom);
  const [activeTab, setActiveTab] = useState('clock');
  const fetchPreferences = useSetAtom(fetchPreferencesAtom);
  const { hasPermission } = usePermissions();
  const canViewPersonalStats = hasPermission(PERMISSIONS.VIEW_TIMESHEETS);
  const canViewTeamStats = hasPermission(PERMISSIONS.VIEW_MEMBERS);

  useEffect(() => {
    if (restaurantId) {
      fetchPreferences();
    }
  }, [restaurantId, fetchPreferences]);

  return (
    <Container className="py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className={cn(
            "text-[34px] font-bold leading-tight mb-2",
            theme === 'dark' ? 'text-white' : 'text-black'
          )}>Shift Tracking</h1>
          <p className={cn(
            "text-[17px]",
            theme === 'dark' ? 'text-white/60' : 'text-black/60'
          )}>Manage your work hours and track your bank of hours.</p>
        </div>
        
        <Tabs 
          defaultValue={timeFormat} 
          value={timeFormat} 
          onChange={(v) => setTimeFormat(v as '12h' | '24h')}
        >
          <TabsList 
            className={cn(
              "p-1",
              theme === 'dark' ? "bg-white/5 border-white/80" : "bg-black/10 border-black/5"
            )}
            variant="glass"
          >
            <TabsTrigger 
              value="24h"
              className={cn(
                "px-4 py-1.5 text-[13px]",
                timeFormat === '24h' && theme === 'dark' && "bg-white/50 text-black/80 shadow-sm"
              )}
            >
              24h
            </TabsTrigger>
            <TabsTrigger 
              value="12h"
              className={cn(
                "px-4 py-1.5 text-[13px]",
                timeFormat === '12h' && theme === 'dark' && "bg-white/50 text-black/80 shadow-sm"
              )}
            >
              12h
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="clock" value={activeTab} onChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          {canViewPersonalStats && (
            <TabsTrigger value="stats">Personal Stats</TabsTrigger>
          )}
          {canViewTeamStats && (
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="clock">
          <ClockSection restaurantId={restaurantId} />
        </TabsContent>

        {canViewPersonalStats && (
          <TabsContent value="stats">
            <StatsDashboard restaurantId={restaurantId} />
          </TabsContent>
        )}

        {canViewTeamStats && (
          <TabsContent value="team">
            <TeamStats restaurantId={restaurantId} />
          </TabsContent>
        )}
      </Tabs>
    </Container>
  );
}

