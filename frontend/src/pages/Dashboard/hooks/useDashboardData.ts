import { useState, useEffect } from 'react';
import type { DashboardStats } from '../types';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Mock data for demo
        await new Promise((resolve) => setTimeout(resolve, 500));

        setStats({
          totalOrders: 142,
          activeOrders: 8,
          completedOrders: 134,
          revenue: 15842.5,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
}
