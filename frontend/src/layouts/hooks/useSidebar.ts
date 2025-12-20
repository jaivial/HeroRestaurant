import { useState, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { sidebarOpenAtom, toggleSidebarAtom } from '@/atoms/layoutAtoms';
import { currentUserGlobalFlagsAtom } from '@/atoms/authAtoms';
import { useViewport } from '@/hooks/useViewport';
import { usePermissions } from '@/hooks/usePermissions';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import { USER_ACCESS_FLAGS } from '@/utils/permissions';
import { NAV_ITEMS, INTERNAL_NAV_ITEMS } from '../config';
import type { SidebarData, SidebarActions } from '../types';

export function useSidebar(): SidebarData & SidebarActions {
  const sidebarOpen = useAtomValue(sidebarOpenAtom);
  const toggleSidebar = useSetAtom(toggleSidebarAtom);
  const { isMobile } = useViewport();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const workspace = useAtomValue(currentWorkspaceAtom);
  const { hasPermission } = usePermissions();
  const globalFlags = useAtomValue(currentUserGlobalFlagsAtom);
  const [internalOpen, setInternalOpen] = useState(false);

  const isRoot = useMemo(() => (globalFlags & USER_ACCESS_FLAGS.ROOT) !== 0n, [globalFlags]);

  const handleNavigation = useCallback((path: string) => {
    navigate(`/w/${workspaceId}/${path}`);
    if (isMobile) {
      toggleSidebar();
    }
  }, [navigate, workspaceId, isMobile, toggleSidebar]);

  const isActive = useCallback((path: string) => {
    return location.pathname.includes(`/${path}`);
  }, [location.pathname]);

  const filteredNavItems = useMemo(() => 
    NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)),
    [hasPermission]
  );

  return {
    sidebarOpen,
    isMobile,
    workspaceName: workspace?.name || 'Workspace',
    workspaceSlug: workspace?.slug || 'workspace',
    isRoot,
    filteredNavItems,
    internalNavItems: INTERNAL_NAV_ITEMS,
    internalOpen,
    currentPath: location.pathname,
    toggleSidebar: () => toggleSidebar(),
    handleNavigation,
    isActive,
    setInternalOpen,
  };
}

