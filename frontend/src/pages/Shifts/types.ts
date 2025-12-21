// frontend/src/pages/Shifts/types.ts

export type ShiftPeriod = 'daily' | 'weekly' | 'monthly' | 'trimestral' | 'semmestral' | 'anual';

export interface ShiftStats {
  workedMinutes: number;
  contractedMinutes: number;
  differenceMinutes: number;
  status: 'healthy' | 'caution' | 'overworked' | 'critical';
}

export interface MemberShiftSummary {
  id: string;
  name: string;
  email: string;
  totalWorkedThisWeek: number;
  totalBankOfHours: number;
  status: 'healthy' | 'caution' | 'overworked' | 'critical';
}

export interface ShiftHistoryItem {
  id: string;
  punchInAt: string;
  punchOutAt: string | null;
  totalMinutes: number | null;
  notes?: string;
}

export interface ShiftsProps {
  restaurantId: string;
}

export interface TeamStatsProps {
  restaurantId: string;
}

