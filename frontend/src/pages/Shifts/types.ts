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
  // Enhanced info
  active_punch_in_at?: string | null;
  role_name?: string;
  role_color?: string;
  membership_status?: string;
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

export interface ScheduledShift {
  id: string;
  membership_id: string;
  start_at: string;
  end_at: string;
  notes: string | null;
  member_name?: string;
  member_email?: string;
}

export interface NewScheduledShift {
  membership_id: string;
  start_at: string;
  end_at: string;
  notes?: string;
}

export interface ShiftAssignmentProps {
  restaurantId: string;
}

