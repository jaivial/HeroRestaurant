import { useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserPriorityAtom, canViewReservationsAtom, canManageReservationsAtom } from '@/atoms/permissionAtoms';
import { useBookingData } from './hooks/useBookingData';
import { useBookingActions } from './hooks/useBookingActions';
import { useBookingFilters } from './hooks/useBookingFilters';
import { Container, Heading, Text, Button, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { bookingsAtom, isReservationFormOpenAtom } from './atoms/bookingAtoms';
import type { BookingManagerProps, Booking, BookingStats } from './types';

function StatsBar({ stats, isLoading }: { stats: BookingStats | null; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-[2.2rem] bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const statItems = [
    { label: 'Total', value: stats.totalBookings, color: 'text-gray-900 dark:text-gray-100' },
    { label: 'Pending', value: stats.pendingConfirmations, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Seated', value: stats.currentlySeated, color: 'text-green-600 dark:text-green-400' },
    { label: 'Upcoming', value: stats.upcomingReservations, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Waitlist', value: stats.waitlistCount, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'No-shows', value: stats.noShowsToday, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="p-4 rounded-[2.2rem] bg-white/72 dark:bg-black/50 backdrop-blur-[20px] border border-white/[0.18] dark:border-white/10"
        >
          <Text size="xs" color="secondary" className="uppercase tracking-wide">{item.label}</Text>
          <Text size="3xl" weight="bold" className={item.color}>{item.value}</Text>
        </div>
      ))}
    </div>
  );
}

export function BookingManager({ restaurantId }: BookingManagerProps) {
  const { bookings, tables, stats, isLoading, error, refetch } = useBookingData({ restaurantId });
  const { createBooking, updateStatus, assignTable } = useBookingActions({ restaurantId });
  const { view, setView, selectedDate, setSelectedDate, navigateDate, goToToday } = useBookingFilters();
  const currentUserPriority = useAtomValue(currentUserPriorityAtom);
  const canManage = useAtomValue(canManageReservationsAtom);
  const setIsFormOpen = useSetAtom(isReservationFormOpenAtom);

  const handleCreateBooking = () => {
    setIsFormOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    // Open booking detail panel
    console.log('Booking clicked:', booking);
  };

  const handleTimeSlotClick = (time: string) => {
    console.log('Time slot clicked:', time);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleStatusChange = async (bookingId: string, status: string, reason?: string) => {
    await updateStatus(bookingId, status as any, reason);
    await refetch();
  };

  if (error) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-64">
          <Text color="error">Failed to load booking data</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Heading level={1} className="text-apple-blue mb-1">
            Reservations
          </Heading>
          <Text color="tertiary">
            Manage bookings, tables, and guest relationships
          </Text>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleCreateBooking}
            className="rounded-[1rem] shadow-apple-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} isLoading={isLoading} />

      {/* View Switcher */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <Tabs value={view} onChange={(v) => setView(v as any)}>
          <TabsList variant="glass" className="min-w-[200px]">
            <TabsTrigger value="day" className="flex-1">Day</TabsTrigger>
            <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigateDate(-1)}
            className="rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            variant="secondary"
            onClick={goToToday}
            className="rounded-[1rem] px-4"
          >
            Today
          </Button>
          <Text weight="semibold" className="min-w-[180px] text-center">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Button
            variant="ghost"
            onClick={() => navigateDate(1)}
            className="rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div className="bg-white/72 dark:bg-black/50 backdrop-blur-[20px] rounded-[2.2rem] border border-white/[0.18] p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date(selectedDate);
              date.setDate(1 - date.getDay() + i);
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const dayBookings = bookings.filter(b => b.date === date.toISOString().split('T')[0]);

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    relative aspect-square p-1 rounded-xl
                    transition-all duration-200
                    flex flex-col items-center justify-center
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isSelected 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : isToday
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="text-sm">{date.getDate()}</span>
                  {dayBookings.length > 0 && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View - Timeline */}
      {view === 'day' && (
        <div className="bg-white/72 dark:bg-black/50 backdrop-blur-[20px] rounded-[2.2rem] border border-white/[0.18] p-6">
          <div className="space-y-4">
            {Array.from({ length: 18 }, (_, i) => {
              const hour = 6 + Math.floor(i / 2);
              const minute = i % 2 === 0 ? '00' : '30';
              const time = `${hour.toString().padStart(2, '0')}:${minute}`;
              const timeBookings = bookings.filter(b => b.startTime === time);

              return (
                <div key={time} className="flex gap-4">
                  <div className="w-16 text-sm text-gray-500 pt-1">{time}</div>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-700 pt-2 min-h-[60px]">
                    <div className="flex gap-2 flex-wrap">
                      {timeBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => handleBookingClick(booking)}
                          className={`
                            px-3 py-2 rounded-lg text-left text-sm
                            transition-all duration-200 hover:scale-[1.02]
                            ${booking.status === 'pending' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300'
                              : booking.status === 'confirmed'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300'
                                : booking.status === 'seated'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }
                          `}
                        >
                          <div className="font-medium">{booking.guestName}</div>
                          <div className="text-xs opacity-75">
                            {booking.partySize} guests • {booking.startTime}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-white/72 dark:bg-black/50 backdrop-blur-[20px] rounded-[2.2rem] border border-white/[0.18] p-6">
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="text-sm text-gray-500 text-center py-2">Time</div>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - date.getDay() + i);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={i}
                  className={`text-center py-2 rounded-lg ${isToday ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                >
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Simplified week view content */}
          <Text color="secondary" className="text-center py-12">
            Week view - showing 7 days at a glance
          </Text>
        </div>
      )}
    </Container>
  );
}
