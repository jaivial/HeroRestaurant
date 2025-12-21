// frontend/src/pages/Shifts/Shifts.tsx

import { useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { workspaceIdAtom } from '@/atoms/workspaceAtoms';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { Container, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { ClockSection } from './components/ClockSection';
import { StatsDashboard } from './components/StatsDashboard';
import { TeamStats } from './components/TeamStats';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/utils/permissions';

export function Shifts() {
  const restaurantId = useAtomValue(workspaceIdAtom);
  const [timeFormat, setTimeFormat] = useAtom(timeFormatAtom);
  const [activeTab, setActiveTab] = useState('clock');
  const { hasPermission } = usePermissions();
  const canViewPersonalStats = hasPermission(PERMISSIONS.VIEW_TIMESHEETS);
  const canViewTeamStats = hasPermission(PERMISSIONS.VIEW_MEMBERS);

  if (!restaurantId) return null;

  return (
    <Container className="py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[34px] font-bold leading-tight mb-2">Shift Tracking</h1>
          <p className="text-[17px] opacity-60">Manage your work hours and track your bank of hours.</p>
        </div>
        <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/5 p-1 rounded-full border border-black/[0.06] dark:border-white/10">
          <button 
            onClick={() => setTimeFormat('24h')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${timeFormat === '24h' ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : 'opacity-40 hover:opacity-60'}`}
          >
            24h
          </button>
          <button 
            onClick={() => setTimeFormat('12h')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${timeFormat === '12h' ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : 'opacity-40 hover:opacity-60'}`}
          >
            12h
          </button>
        </div>
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

