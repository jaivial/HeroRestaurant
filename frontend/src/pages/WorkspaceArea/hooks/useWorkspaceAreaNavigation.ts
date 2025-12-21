import { useState, useCallback, useMemo } from 'react';
import type { WorkspaceTab } from '../types';

export function useWorkspaceAreaNavigation() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs = useMemo<WorkspaceTab[]>(() => [
    { id: 'overview', label: 'Overview' },
  ], []);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
  }, []);

  return {
    activeTab,
    tabs,
    handleTabChange,
  };
}

