import type { Workspace } from '@/types';

export interface WorkspaceAreaProps {}

export interface WorkspaceTab {
  id: string;
  label: string;
}

export interface WorkspaceStats {
  activeMenus: number;
  totalMenus: number;
  totalMembers: number;
  activeOrders?: number;
}

export interface OverviewTabProps {
  workspace: Workspace | null;
  stats: WorkspaceStats;
  isLoading: boolean;
}
