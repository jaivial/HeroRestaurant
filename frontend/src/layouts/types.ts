export interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: bigint;
}

export type SidebarProps = Record<string, never>;

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

