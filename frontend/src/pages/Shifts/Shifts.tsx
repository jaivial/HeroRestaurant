// frontend/src/pages/Shifts/Shifts.tsx

import { Container, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ClockSection } from './components/ClockSection';
import { StatsDashboard } from './components/StatsDashboard';
import { TeamStats } from './components/TeamStats';
import { ShiftAssignment } from './components/ShiftAssignment';
import { useShiftsPage } from './hooks/useShiftsPage';

export function Shifts() {
  const {
    restaurantId,
    theme,
    timeFormat,
    activeTab,
    setActiveTab,
    canViewPersonalStats,
    canViewTeamStats,
    showAssignmentTab,
    handleTimeFormatChange
  } = useShiftsPage();

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
          value={timeFormat} 
          onChange={handleTimeFormatChange}
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

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          {canViewPersonalStats && (
            <TabsTrigger value="stats">Personal Stats</TabsTrigger>
          )}
          {canViewTeamStats && (
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          )}
          {showAssignmentTab && (
            <TabsTrigger value="assignment">Shift Assignment</TabsTrigger>
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

        {showAssignmentTab && (
          <TabsContent value="assignment">
            <ShiftAssignment restaurantId={restaurantId} />
          </TabsContent>
        )}
      </Tabs>
    </Container>
  );
}
