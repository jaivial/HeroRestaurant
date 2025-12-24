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
  color: string | null;
  label: string | null;
  member_name?: string;
  member_email?: string;
}

export interface NewScheduledShift {
  membership_id: string;
  start_at: string;
  end_at: string;
  notes?: string;
  color?: string;
  label?: string;
}

export interface ShiftAssignmentProps {
  restaurantId: string;
}

export interface AssignShiftModalProps {
  members: MemberShiftSummary[];
  onClose: () => void;
  onAssign: (data: NewScheduledShift) => Promise<any>;
}

export interface EditShiftModalProps {
  shift: ScheduledShift;
  members: MemberShiftSummary[];
  onClose: () => void;
  onUpdate: (data: NewScheduledShift) => Promise<any>;
  onRemove: (id: string) => Promise<void>;
}

export interface AssignShiftFormProps {
  isEdit?: boolean;
  onRemove?: () => void;
  memberId: string;
  setMemberId: (id: string) => void;
  date: string;
  setDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  color: string;
  setColor: (color: string) => void;
  label: string;
  setLabel: (label: string) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  memberOptions: { label: string, value: string }[];
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showStartTimePicker: boolean;
  setShowStartTimePicker: (show: boolean) => void;
  showEndTimePicker: boolean;
  setShowEndTimePicker: (show: boolean) => void;
}

export interface WeeklyCalendarProps {
  history: ShiftHistoryItem[];
  scheduled?: ScheduledShift[];
  isConstrained?: boolean;
  onShiftClick?: (shift: ScheduledShift | ShiftHistoryItem, type: 'scheduled' | 'history') => void;
}

export interface WeeklyCalendarUIProps extends WeeklyCalendarProps {
  isDark: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  layout: 'horizontal' | 'vertical';
  setLayout: (layout: 'horizontal' | 'vertical') => void;
  weekOffset: number;
  isAnimating: boolean;
  calendarDays: any[];
  currentVerticalWeek: any[];
  weekRangeLabel: string;
  onDragStart: (pageX: number, offsetLeft: number) => void;
  onDragMove: (pageX: number, offsetLeft: number, multiplier?: number) => void;
  onDragEnd: () => void;
  onGoToToday: () => void;
  onWeekChange: (dir: 'next' | 'prev') => void;
  onShiftClick?: (shift: ScheduledShift | ShiftHistoryItem, type: 'scheduled' | 'history') => void;
  verticalContainerRef: React.RefObject<HTMLDivElement>;
}

export interface MonthlyCalendarProps {
  history: ShiftHistoryItem[];
}

export interface MonthlyCalendarUIProps extends MonthlyCalendarProps {
  isDark: boolean;
  calendarData: any[];
  monthName: string;
  yearName: number;
  weekdays: string[];
  onChangeMonth: (offset: number) => void;
  onGoToToday: () => void;
}

// ─── Heatmap Types ──────────────────────────────────────────
export interface HeatmapData {
  day: number; // 0-6
  hour: number; // 0-23
  intensity: number;
}

export interface MemberActivityHeatmapProps {
  history: ShiftHistoryItem[];
}

export interface MemberActivityHeatmapUIProps {
  heatmapData: HeatmapData[];
  maxIntensity: number;
  isDark: boolean;
}

// ─── Analysis Types ─────────────────────────────────────────
export interface MemberAnalysisProps {
  memberId: string;
  restaurantId: string;
  memberStats: {
    workedMinutes: number;
    differenceMinutes: number;
  };
}

export interface MemberAnalysisUIProps {
  memberStats: {
    label: string;
    value: number;
    teamAvg: number;
    unit: string;
    description: string;
    trend: 'up' | 'down' | 'neutral';
  }[];
}

