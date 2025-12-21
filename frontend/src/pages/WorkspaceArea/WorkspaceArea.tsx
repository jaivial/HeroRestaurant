import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs/Tabs';
import { Text } from '@/components/ui/Text/Text';
import { useWorkspaceAreaData } from './hooks/useWorkspaceAreaData';
import { useWorkspaceAreaNavigation } from './hooks/useWorkspaceAreaNavigation';
import { OverviewTab } from './components/Overview/OverviewTab';
import type { WorkspaceAreaProps } from './types';

/**
 * Layer 1: Page Component - WorkspaceArea
 * Orchestrates the workspace management experience with Overview.
 */
export const WorkspaceArea = memo((_props: WorkspaceAreaProps) => {
  const { workspace, stats, isLoading } = useWorkspaceAreaData();
  const { activeTab, tabs, handleTabChange } = useWorkspaceAreaNavigation();

  return (
    <Container className="py-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
           <Text variant="largeTitle" weight="bold">Workspace</Text>
           {isLoading && <span className="animate-pulse opacity-50 text-[34px]">...</span>}
        </div>
        <Text variant="body" color="secondary">
          View high-level performance metrics for your workspace.
        </Text>
      </header>

      <Tabs value={activeTab} onChange={handleTabChange} defaultValue="overview">
        {tabs.length > 1 && (
          <TabsList className="mb-8" variant="glass">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab 
              workspace={workspace} 
              stats={stats} 
              isLoading={isLoading} 
            />
          )}
        </div>
      </Tabs>
    </Container>
  );
});

WorkspaceArea.displayName = 'WorkspaceArea';

export default WorkspaceArea;
