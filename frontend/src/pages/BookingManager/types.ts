export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'seated' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type BookingSource = 
  | 'phone' 
  | 'walk_in' 
  | 'online' 
  | 'third_party' 
  | 'staff';

export type TableShape = 'round' | 'square' | 'rectangle' | 'custom';

export type WaitlistStatus = 'waiting' | 'notified' | 'seated' | 'left';

export type CalendarView = 'day' | 'week' | 'month';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  minCapacity: number;
  section: string | null;
  positionX: number | null;
  positionY: number | null;
  shape: TableShape;
  isActive: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalVisits: number;
  totalNoShows: number;
  totalCancellations: number;
  preferences: string[];
  tags: string[];
  blocked: boolean;
  blockedReason: string | null;
  lastVisitAt: Date | null;
  notes: string | null;
}

export interface Booking {
  id: string;
  guestId: string | null;
  tableId: string | null;
  tableGroupId: string | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  partySize: number;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: BookingStatus;
  source: BookingSource;
  notes: string | null;
  dietaryRequirements: string[];
  confirmationSentAt: Date | null;
  reminderSentAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: 'staff' | 'guest' | null;
  cancellationReason: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistEntry {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  partySize: number;
  quotedWaitMinutes: number | null;
  notes: string | null;
  status: WaitlistStatus;
  position: number;
  notifiedAt: Date | null;
  seatedAt: Date | null;
  createdAt: Date;
}

export interface BookingStats {
  totalBookings: number;
  pendingConfirmations: number;
  currentlySeated: number;
  upcomingReservations: number;
  waitlistCount: number;
  noShowsToday: number;
  cancelledToday: number;
}

export interface BookingFilters {
  view: CalendarView;
  selectedDate: Date;
  statusFilter: BookingStatus[];
  sourceFilter: BookingSource[];
  searchQuery: string;
}

export interface BookingFormData {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  partySize: number;
  date: string;
  startTime: string;
  duration: number;
  tableId: string | null;
  source: BookingSource;
  notes: string;
  dietaryRequirements: string[];
}

export interface BookingManagerProps {
  restaurantId: string;
}

export interface CalendarViewProps {
  bookings: Booking[];
  tables: Table[];
  selectedDate: Date;
  view: CalendarView;
  onBookingClick: (booking: Booking) => void;
  onTimeSlotClick: (date: string, time: string) => void;
}

export interface DayViewProps {
  bookings: Booking[];
  selectedDate: Date;
  onBookingClick: (booking: Booking) => void;
  onTimeSlotClick: (time: string) => void;
}

export interface WeekViewProps {
  bookings: Booking[];
  selectedDate: Date;
  onBookingClick: (booking: Booking) => void;
  onDateClick: (date: Date) => void;
}

export interface MonthViewProps {
  bookings: Booking[];
  selectedDate: Date;
  onBookingClick: (booking: Booking) => void;
  onDateClick: (date: Date) => void;
}

export interface BookingCardProps {
  booking: Booking;
  table?: Table;
  onClick: () => void;
  className?: string;
}

export interface TimelineViewProps {
  tables: Table[];
  bookings: Booking[];
  selectedDate: Date;
  onTableClick: (table: Table) => void;
  onBookingClick: (booking: Booking) => void;
}

export interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
  initialDate?: string;
  initialTime?: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
}

export interface GuestProfileProps {
  guest: Guest;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onClose: () => void;
}

export interface WaitlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entries: WaitlistEntry[];
  onSeat: (entryId: string, tableId: string) => Promise<void>;
  onRemove: (entryId: string) => Promise<void>;
}

export interface BookingDetailProps {
  booking: Booking | null;
  table?: Table | null;
  onClose: () => void;
  onStatusChange: (bookingId: string, status: BookingStatus, reason?: string) => Promise<void>;
  onAssignTable: (bookingId: string, tableId: string) => Promise<void>;
  onEdit: (booking: Booking) => void;
}

export interface StatsBarProps {
  stats: BookingStats | null;
  isLoading: boolean;
}

export interface UseBookingDataReturn {
  bookings: Booking[];
  tables: Table[];
  guests: Guest[];
  stats: BookingStats | null;
  waitlist: WaitlistEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseBookingActionsReturn {
  createBooking: (data: BookingFormData) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<Booking>;
  updateStatus: (id: string, status: BookingStatus, reason?: string) => Promise<void>;
  assignTable: (bookingId: string, tableId: string) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  seatGuest: (id: string) => Promise<void>;
  addToWaitlist: (data: { guestName: string; guestPhone: string; guestEmail?: string; partySize: number; notes?: string }) => Promise<void>;
  seatFromWaitlist: (entryId: string, tableId: string) => Promise<void>;
  removeFromWaitlist: (entryId: string) => Promise<void>;
}

export interface UseBookingFiltersReturn {
  view: CalendarView;
  setView: (view: CalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  statusFilter: BookingStatus[];
  setStatusFilter: (statuses: BookingStatus[]) => void;
  sourceFilter: BookingSource[];
  setSourceFilter: (sources: BookingSource[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  navigateDate: (direction: -1 | 1) => void;
  goToToday: () => void;
  resetFilters: () => void;
}
