import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { addBookingAtom, updateBookingAtom, updateBookingStatusAtom, removeBookingAtom, addWaitlistEntryAtom, removeWaitlistEntryAtom, setStatsAtom } from '../atoms/bookingAtoms';
import type { Booking, BookingFormData, BookingStatus, WaitlistEntry } from '../types';

interface UseBookingActionsProps {
  restaurantId: string;
}

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Session ${localStorage.getItem('sessionId') ?? ''}`,
  };
}

export function useBookingActions({ restaurantId }: UseBookingActionsProps) {
  const addBooking = useSetAtom(addBookingAtom);
  const updateBooking = useSetAtom(updateBookingAtom);
  const updateStatus = useSetAtom(updateBookingStatusAtom);
  const removeBooking = useSetAtom(removeBookingAtom);
  const addWaitlistEntry = useSetAtom(addWaitlistEntryAtom);
  const removeWaitlistEntry = useSetAtom(removeWaitlistEntryAtom);
  const setStats = useSetAtom(setStatsAtom);

  const createBooking = useCallback(async (data: BookingFormData): Promise<Booking> => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        restaurantId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to create booking');
    }

    const result = await response.json();
    if (result.success) {
      addBooking(result.data as Booking);
      return result.data;
    }

    throw new Error('Failed to create booking');
  }, [restaurantId, addBooking]);

  const updateBookingData = useCallback(async (id: string, data: Partial<Booking>): Promise<Booking> => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to update booking');
    }

    const result = await response.json();
    if (result.success) {
      updateBooking(result.data as Booking);
      return result.data;
    }

    throw new Error('Failed to update booking');
  }, [updateBooking]);

  const changeStatus = useCallback(async (
    id: string, 
    status: BookingStatus, 
    reason?: string
  ): Promise<void> => {
    const response = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to update status');
    }

    const result = await response.json();
    if (result.success) {
      updateStatus(id, status);
    }
  }, [updateStatus]);

  const assignTable = useCallback(async (bookingId: string, tableId: string): Promise<void> => {
    const response = await fetch(`/api/bookings/${bookingId}/table`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tableId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to assign table');
    }

    const result = await response.json();
    if (result.success) {
      updateBooking(result.data);
    }
  }, [updateBooking]);

  const cancelBooking = useCallback(async (id: string, reason: string): Promise<void> => {
    await changeStatus(id, 'cancelled', reason);
  }, [changeStatus]);

  const markNoShow = useCallback(async (id: string): Promise<void> => {
    await changeStatus(id, 'no_show');
  }, [changeStatus]);

  const seatGuest = useCallback(async (id: string): Promise<void> => {
    await changeStatus(id, 'seated');
  }, [changeStatus]);

  const confirmBooking = useCallback(async (id: string): Promise<void> => {
    await changeStatus(id, 'confirmed');
  }, [changeStatus]);

  const completeBooking = useCallback(async (id: string): Promise<void> => {
    await changeStatus(id, 'completed');
  }, [changeStatus]);

  const addToWaitlist = useCallback(async (data: {
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    partySize: number;
    notes?: string;
  }): Promise<WaitlistEntry> => {
    const response = await fetch('/api/bookings/waitlist', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to add to waitlist');
    }

    const result = await response.json();
    if (result.success) {
      addWaitlistEntry(result.data as WaitlistEntry);
      return result.data;
    }

    throw new Error('Failed to add to waitlist');
  }, [addWaitlistEntry]);

  const seatFromWaitlist = useCallback(async (entryId: string, tableId: string): Promise<void> => {
    const response = await fetch('/api/bookings/waitlist/seat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryId, tableId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to seat from waitlist');
    }

    const result = await response.json();
    if (result.success) {
      removeWaitlistEntry(entryId);
    }
  }, [removeWaitlistEntry]);

  const removeFromWaitlist = useCallback(async (entryId: string): Promise<void> => {
    const response = await fetch(`/api/bookings/waitlist/${entryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Failed to remove from waitlist');
    }

    removeWaitlistEntry(entryId);
  }, [removeWaitlistEntry]);

  const refreshStats = useCallback(async (date?: string): Promise<void> => {
    const dateParam = date ?? new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/bookings/stats?date=${dateParam}`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    }
  }, [setStats]);

  return {
    createBooking,
    updateBooking: updateBookingData,
    updateStatus: changeStatus,
    assignTable,
    cancelBooking,
    markNoShow,
    seatGuest,
    confirmBooking,
    completeBooking,
    addToWaitlist,
    seatFromWaitlist,
    removeFromWaitlist,
    refreshStats,
  };
}
