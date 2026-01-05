import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Booking, Table, Guest, BookingStats, WaitlistEntry, BookingStatus, BookingSource, CalendarView, BookingFilters } from './types';

export const bookingsAtom = atom<Booking[]>([]);
export const tablesAtom = atom<Table[]>([]);
export const guestsAtom = atom<Guest[]>([]);
export const statsAtom = atom<BookingStats | null>(null);
export const waitlistAtom = atom<WaitlistEntry[]>([]);

export const calendarViewAtom = atom<CalendarView>('day');
export const selectedDateAtom = atom<Date>(new Date());

const statusFilterAtom = atom<BookingStatus[]>([]);
const sourceFilterAtom = atom<BookingSource[]>([]);
const searchQueryAtom = atom<string>('');

export const bookingFiltersAtom = atomWithStorage<BookingFilters>('booking-filters', {
  view: 'day',
  selectedDate: new Date(),
  statusFilter: [],
  sourceFilter: [],
  searchQuery: '',
});

export const selectedBookingIdAtom = atom<string | null>(null);
export const isReservationFormOpenAtom = atom<boolean>(false);
export const formInitialDataAtom = atom<{
  date?: string;
  time?: string;
  booking?: Booking;
} | null>(null);

export const isWaitlistPanelOpenAtom = atom<boolean>(false);
export const isGuestProfileOpenAtom = atom<boolean>(false);
export const selectedGuestIdAtom = atom<string | null>(null);
export const editingBookingIdAtom = atom<string | null>(null);

export const filteredBookingsAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  const filters = get(bookingFiltersAtom);
  const searchQuery = get(searchQueryAtom).toLowerCase();

  return bookings.filter((booking) => {
    if (filters.statusFilter.length > 0 && 
        !filters.statusFilter.includes(booking.status)) {
      return false;
    }

    if (filters.sourceFilter.length > 0 && 
        !filters.sourceFilter.includes(booking.source)) {
      return false;
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!booking.guestName.toLowerCase().includes(searchLower) &&
          !booking.guestPhone.includes(searchQuery) &&
          (booking.guestEmail?.toLowerCase().includes(searchLower) ?? false)) {
        return false;
      }
    }

    const bookingDate = new Date(booking.date);
    if (bookingDate.toDateString() !== filters.selectedDate.toDateString()) {
      return false;
    }

    return true;
  });
});

export const upcomingBookingsAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return bookings
    .filter((b) => 
      b.date === today && 
      b.status === 'confirmed' && 
      b.startTime >= currentTime
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);
});

export const selectedBookingAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  const selectedId = get(selectedBookingIdAtom);
  return bookings.find((b) => b.id === selectedId) ?? null;
});

export const selectedGuestAtom = atom((get) => {
  const guests = get(guestsAtom);
  const selectedId = get(selectedGuestIdAtom);
  return guests.find((g) => g.id === selectedId) ?? null;
});

export const todayStatsAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today);

  return {
    total: todayBookings.length,
    pending: todayBookings.filter((b) => b.status === 'pending').length,
    confirmed: todayBookings.filter((b) => b.status === 'confirmed').length,
    seated: todayBookings.filter((b) => b.status === 'seated').length,
    completed: todayBookings.filter((b) => b.status === 'completed').length,
    cancelled: todayBookings.filter((b) => b.status === 'cancelled').length,
    noShow: todayBookings.filter((b) => b.status === 'no_show').length,
  };
});

export const bookingsByDateAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  return bookings.reduce((acc, booking) => {
    if (!acc[booking.date]) {
      acc[booking.date] = [];
    }
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);
});

export const bookingsByTableAtom = atom((get) => {
  const bookings = get(bookingsAtom);
  const selectedDate = get(selectedDateAtom);
  const dateStr = selectedDate.toISOString().split('T')[0];

  return bookings
    .filter((b) => b.date === dateStr && b.tableId)
    .reduce((acc, booking) => {
      if (booking.tableId) {
        if (!acc[booking.tableId]) {
          acc[booking.tableId] = [];
        }
        acc[booking.tableId].push(booking);
      }
      return acc;
    }, {} as Record<string, Booking[]>);
});

export const tablesBySectionAtom = atom((get) => {
  const tables = get(tablesAtom);
  return tables.reduce((acc, table) => {
    const section = table.section ?? 'Unassigned';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(table);
    return acc;
  }, {} as Record<string, Table[]>);
});

export const setBookingsAtom = atom(
  null,
  (get, set, bookings: Booking[]) => {
    set(bookingsAtom, bookings);
  }
);

export const addBookingAtom = atom(
  null,
  (get, set, booking: Booking) => {
    const bookings = get(bookingsAtom);
    set(bookingsAtom, [...bookings, booking]);
  }
);

export const updateBookingAtom = atom(
  null,
  (get, set, updatedBooking: Booking) => {
    const bookings = get(bookingsAtom);
    set(
      bookingsAtom,
      bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  }
);

export const updateBookingStatusAtom = atom(
  null,
  (get, set, bookingId: string, newStatus: BookingStatus) => {
    const bookings = get(bookingsAtom);
    set(
      bookingsAtom,
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  }
);

export const removeBookingAtom = atom(
  null,
  (get, set, bookingId: string) => {
    const bookings = get(bookingsAtom);
    set(bookingsAtom, bookings.filter((b) => b.id !== bookingId));
  }
);

export const setTablesAtom = atom(
  null,
  (get, set, tables: Table[]) => {
    set(tablesAtom, tables);
  }
);

export const setStatsAtom = atom(
  null,
  (get, set, stats: BookingStats) => {
    set(statsAtom, stats);
  }
);

export const setWaitlistAtom = atom(
  null,
  (get, set, entries: WaitlistEntry[]) => {
    set(waitlistAtom, entries);
  }
);

export const addWaitlistEntryAtom = atom(
  null,
  (get, set, entry: WaitlistEntry) => {
    const entries = get(waitlistAtom);
    set(waitlistAtom, [...entries, entry]);
  }
);

export const updateWaitlistEntryAtom = atom(
  null,
  (get, set, updatedEntry: WaitlistEntry) => {
    const entries = get(waitlistAtom);
    set(
      waitlistAtom,
      entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  }
);

export const removeWaitlistEntryAtom = atom(
  null,
  (get, set, entryId: string) => {
    const entries = get(waitlistAtom);
    set(waitlistAtom, entries.filter((e) => e.id !== entryId));
  }
);
