import type { PERMISSIONS } from '@/utils/permissions';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: bigint;
}

export interface SidebarProps {}

export interface SidebarData {
  sidebarOpen: boolean;
  isMobile: boolean;
  workspaceName: string;
  workspaceSlug: string;
  isRoot: boolean;
  filteredNavItems: NavItem[];
  internalNavItems: NavItem[];
  internalOpen: boolean;
  currentPath: string;
}

export interface SidebarActions {
  toggleSidebar: () => void;
  handleNavigation: (path: string) => void;
  isActive: (path: string) => boolean;
  setInternalOpen: (open: boolean) => void;
}

