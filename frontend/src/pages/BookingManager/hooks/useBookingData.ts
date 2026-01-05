import { useCallback, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { bookingsAtom, tablesAtom, statsAtom, waitlistAtom } from '../atoms/bookingAtoms';
import type { Booking, Table, BookingStats, WaitlistEntry } from '../types';

interface UseBookingDataProps {
  restaurantId: string;
}

export function useBookingData({ restaurantId }: UseBookingDataProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const setBookings = useSetAtom(bookingsAtom);
  const setTables = useSetAtom(tablesAtom);
  const setStats = useSetAtom(statsAtom);
  const setWaitlist = useSetAtom(waitlistAtom);

  const fetchBookings = useCallback(async () => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

      const response = await fetch(`/api/bookings?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Session ${localStorage.getItem('sessionId') ?? ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const result = await response.json();
      if (result.success) {
        const bookings: Booking[] = [];
        Object.entries(result.data).forEach(([, dateBookings]) => {
          bookings.push(...(dateBookings as Booking[]));
        });
        setBookings(bookings);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    }
  }, [setBookings]);

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch('/api/tables', {
        headers: {
          'Authorization': `Session ${localStorage.getItem('sessionId') ?? ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tables');

      const result = await response.json();
      if (result.success) {
        setTables(result.data as Table[]);
      }
    } catch (e) {
      console.error('Failed to fetch tables:', e);
    }
  }, [setTables]);

  const fetchStats = useCallback(async (date?: string) => {
    try {
      const dateParam = date ?? new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/bookings/stats?date=${dateParam}`, {
        headers: {
          'Authorization': `Session ${localStorage.getItem('sessionId') ?? ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const result = await response.json();
      if (result.success) {
        setStats(result.data as BookingStats);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }, [setStats]);

  const fetchWaitlist = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings/waitlist', {
        headers: {
          'Authorization': `Session ${localStorage.getItem('sessionId') ?? ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch waitlist');

      const result = await response.json();
      if (result.success) {
        setWaitlist(result.data as WaitlistEntry[]);
      }
    } catch (e) {
      console.error('Failed to fetch waitlist:', e);
    }
  }, [setWaitlist]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchBookings(),
      fetchTables(),
      fetchStats(),
      fetchWaitlist(),
    ]);
    setIsLoading(false);
  }, [fetchBookings, fetchTables, fetchStats, fetchWaitlist]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    isLoading,
    error,
    refetch,
  };
}

export function useBookingDataReturn() {
  const bookings = useAtomValue(bookingsAtom);
  const tables = useAtomValue(tablesAtom);
  const stats = useAtomValue(statsAtom);
  const waitlist = useAtomValue(waitlistAtom);
  const { isLoading, error, refetch } = useBookingData({ 
    restaurantId: '' 
  });

  return {
    bookings,
    tables,
    stats,
    waitlist,
    isLoading,
    error,
    refetch,
  };
}
