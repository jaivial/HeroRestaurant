export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  revenue: number;
}

// ─── Component Props ─────────────────────────────────────────────

export interface StatsOverviewProps {
  stats: DashboardStats;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface RecentActivityProps {
  activities?: unknown[]; // Placeholder for now
}

export interface QuickActionsProps {
  onAction?: (actionId: string) => void;
}

export interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}
