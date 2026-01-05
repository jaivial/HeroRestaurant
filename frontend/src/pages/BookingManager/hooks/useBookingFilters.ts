import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { calendarViewAtom, selectedDateAtom, bookingFiltersAtom } from '../atoms/bookingAtoms';
import type { CalendarView, BookingStatus, BookingSource } from '../types';

export function useBookingFilters() {
  const [view, setView] = useAtom(calendarViewAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [filters, setFilters] = useAtom(bookingFiltersAtom);

  const navigateDate = useCallback((direction: -1 | 1) => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  }, [selectedDate, view, setSelectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const setStatusFilter = useCallback((statuses: BookingStatus[]) => {
    setFilters((prev) => ({ ...prev, statusFilter: statuses }));
  }, [setFilters]);

  const setSourceFilter = useCallback((sources: BookingSource[]) => {
    setFilters((prev) => ({ ...prev, sourceFilter: sources }));
  }, [setFilters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFilters({
      view,
      selectedDate: new Date(),
      statusFilter: [],
      sourceFilter: [],
      searchQuery: '',
    });
  }, [view, setFilters]);

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    statusFilter: filters.statusFilter,
    setStatusFilter,
    sourceFilter: filters.sourceFilter,
    setSourceFilter,
    searchQuery: filters.searchQuery,
    setSearchQuery,
    navigateDate,
    goToToday,
    resetFilters,
  };
}
