// frontend/src/pages/Shifts/hooks/useTeamStats.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTeamShifts } from './useTeamShifts';
import type { ShiftPeriod } from '../types';

export function useTeamStats(restaurantId: string) {
  const [period, setPeriod] = useState<ShiftPeriod>('monthly');
  const { members, isLoading, setFilters } = useTeamShifts(restaurantId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    setFilters({ period });
  }, [period, setFilters]);

  const periodLabel = useMemo(() => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      trimestral: 'Trimestral',
      semmestral: 'Semmestral',
      anual: 'Anual'
    };
    return labels[period] || 'Weekly';
  }, [period]);

  const handleSelectMember = useCallback((id: string | null) => {
    setSelectedMemberId(id);
  }, []);

  return {
    period,
    setPeriod,
    members,
    isLoading,
    selectedMemberId,
    setSelectedMemberId: handleSelectMember,
    periodLabel
  };
}
