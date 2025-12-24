// frontend/src/pages/Shifts/hooks/useShiftsPage.ts

import { useEffect, useState, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { workspaceIdAtom } from '@/atoms/workspaceAtoms';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { fetchPreferencesAtom } from '@/atoms/preferenceAtoms';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS, USER_ACCESS_FLAGS } from '@/utils/permissions';
import { canManageSchedulesAtom } from '@/atoms/permissionAtoms';
import { currentUserGlobalFlagsAtom } from '@/atoms/authAtoms';

export function useShiftsPage() {
  const restaurantId = useAtomValue(workspaceIdAtom);
  const theme = useAtomValue(themeAtom);
  const [timeFormat, setTimeFormat] = useAtom(timeFormatAtom);
  const [activeTab, setActiveTab] = useState('clock');
  const fetchPreferences = useSetAtom(fetchPreferencesAtom);
  const { hasPermission } = usePermissions();
  
  const canViewPersonalStats = hasPermission(PERMISSIONS.VIEW_TIMESHEETS);
  const canViewTeamStats = hasPermission(PERMISSIONS.VIEW_MEMBERS);
  const canManageSchedules = useAtomValue(canManageSchedulesAtom);
  const globalFlags = useAtomValue(currentUserGlobalFlagsAtom);
  const isRoot = (globalFlags & USER_ACCESS_FLAGS.ROOT) === USER_ACCESS_FLAGS.ROOT;

  const showAssignmentTab = canManageSchedules || isRoot;

  useEffect(() => {
    if (restaurantId) {
      fetchPreferences();
    }
  }, [restaurantId, fetchPreferences]);

  const handleTimeFormatChange = useCallback((v: string) => {
    setTimeFormat(v as '12h' | '24h');
  }, [setTimeFormat]);

  return {
    restaurantId,
    theme,
    timeFormat,
    activeTab,
    setActiveTab,
    canViewPersonalStats,
    canViewTeamStats,
    showAssignmentTab,
    handleTimeFormatChange
  };
}
