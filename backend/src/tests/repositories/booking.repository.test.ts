import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createTestUser, 
  createTestRestaurant, 
  createTestTable, 
  createTestGuest, 
  createTestBooking, 
  cleanupTestData 
} from '../utils/test-helpers';
import { BookingRepository } from '../../repositories/booking.repository';
import { TableRepository } from '../../repositories/table.repository';
import { GuestRepository } from '../../repositories/guest.repository';
import type { Booking, BookingStatus } from '../../types/database.types';

describe('BookingRepository', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;
  let testTable: Awaited<ReturnType<typeof createTestTable>>;
  let testGuest: Awaited<ReturnType<typeof createTestGuest>>;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      email: `repo-test-${Date.now()}@example.com`,
      name: 'Repo Test User',
    });
    testRestaurant = await createTestRestaurant(testUser.id, {
      name: `Repo Test Restaurant ${Date.now()}`,
    });
    testTable = await createTestTable(testRestaurant.id, {
      name: 'Repo Test Table',
      capacity: 4,
    });
    testGuest = await createTestGuest(testRestaurant.id, {
      name: 'Repo Test Guest',
      phone: `+1555${Date.now().toString().slice(-7)}`,
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('findById', () => {
    it('should find a booking by id', async () => {
      const created = await createTestBooking(testRestaurant.id);
      const found = await BookingRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return undefined for non-existent booking', async () => {
      const found = await BookingRepository.findById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('findByDate', () => {
    it('should find bookings for a specific date', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, { date: today });
      await createTestBooking(testRestaurant.id, { date: today });

      const bookings = await BookingRepository.findByDate(testRestaurant.id, today);

      expect(bookings.length).toBeGreaterThanOrEqual(2);
      expect(bookings.every(b => b.date === today)).toBe(true);
    });

    it('should return empty array for date with no bookings', async () => {
      const bookings = await BookingRepository.findByDate(testRestaurant.id, '2020-01-01');
      expect(bookings).toEqual([]);
    });
  });

  describe('findByTimeRange', () => {
    it('should find bookings within a time range', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, {
        date: today,
        startTime: '19:00',
        endTime: '20:30',
      });

      const bookings = await BookingRepository.findByTimeRange(
        testRestaurant.id,
        today,
        '18:00',
        '21:00'
      );

      expect(bookings.length).toBe(1);
    });

    it('should exclude cancelled bookings', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, {
        date: today,
        startTime: '19:00',
        endTime: '20:30',
        status: 'cancelled' as BookingStatus,
      });

      const bookings = await BookingRepository.findByTimeRange(
        testRestaurant.id,
        today,
        '18:00',
        '21:00'
      );

      expect(bookings.length).toBe(0);
    });
  });

  describe('findAvailableTables', () => {
    it('should find available tables for a time slot', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const available = await BookingRepository.findAvailableTables(
        testRestaurant.id,
        today,
        '14:00',
        '16:00',
        2
      );

      expect(available).toContain(testTable.id);
    });

    it('should exclude tables with conflicting bookings', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, {
        tableId: testTable.id,
        date: today,
        startTime: '19:00',
        endTime: '20:30',
      });

      const available = await BookingRepository.findAvailableTables(
        testRestaurant.id,
        today,
        '19:30',
        '21:00',
        2
      );

      expect(available).not.toContain(testTable.id);
    });

    it('should respect party size', async () => {
      const today = new Date().toISOString().split('T')[0];
      const smallTable = await createTestTable(testRestaurant.id, {
        name: 'Small Table',
        capacity: 2,
      });

      const available = await BookingRepository.findAvailableTables(
        testRestaurant.id,
        today,
        '14:00',
        '16:00',
        4
      );

      expect(available).not.toContain(smallTable.id);
      expect(available).toContain(testTable.id);
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const booking = await BookingRepository.create({
        restaurant_id: testRestaurant.id,
        guest_id: testGuest.id,
        table_id: testTable.id,
        guest_name: 'New Booking Guest',
        guest_phone: '+1555000000',
        guest_email: 'booking@example.com',
        party_size: 2,
        date: today,
        start_time: '19:00',
        end_time: '20:30',
        duration_minutes: 90,
        status: 'pending' as BookingStatus,
        source: 'phone',
        dietary_requirements: '[]',
        created_by_user_id: testUser.id,
      });

      expect(booking.id).toBeDefined();
      expect(booking.guest_name).toBe('New Booking Guest');
      expect(booking.status).toBe('pending');
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const booking = await createTestBooking(testRestaurant.id);
      
      const updated = await BookingRepository.updateStatus(
        booking.id,
        'confirmed'
      );

      expect(updated?.status).toBe('confirmed');
      expect(updated?.cancelled_at).toBeUndefined();
    });

    it('should set cancelled_at when status is cancelled', async () => {
      const booking = await createTestBooking(testRestaurant.id);
      
      const updated = await BookingRepository.updateStatus(
        booking.id,
        'cancelled',
        { cancelled_by: 'staff' as const, cancellation_reason: 'Test' }
      );

      expect(updated?.status).toBe('cancelled');
      expect(updated?.cancelled_at).toBeDefined();
      expect(updated?.cancelled_by).toBe('staff');
    });
  });

  describe('assignTable', () => {
    it('should assign a table to booking', async () => {
      const booking = await createTestBooking(testRestaurant.id, {
        tableId: null,
      });

      const updated = await BookingRepository.assignTable(booking.id, testTable.id);

      expect(updated?.table_id).toBe(testTable.id);
    });
  });

  describe('countByStatus', () => {
    it('should count bookings by status', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, { date: today, status: 'pending' as BookingStatus });
      await createTestBooking(testRestaurant.id, { date: today, status: 'pending' as BookingStatus });
      await createTestBooking(testRestaurant.id, { date: today, status: 'confirmed' as BookingStatus });

      const pendingCount = await BookingRepository.countByStatus(
        testRestaurant.id,
        today,
        'pending' as BookingStatus
      );

      expect(pendingCount).toBe(2);
    });
  });
});

describe('TableRepository', () => {
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;

  beforeEach(async () => {
    await cleanupTestData();
    const testUser = await createTestUser();
    testRestaurant = await createTestRestaurant(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('findById', () => {
    it('should find a table by id', async () => {
      const created = await createTestTable(testRestaurant.id);
      const found = await TableRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });
  });

  describe('findByRestaurant', () => {
    it('should find all active tables for a restaurant', async () => {
      await createTestTable(testRestaurant.id, { name: 'Table 1' });
      await createTestTable(testRestaurant.id, { name: 'Table 2' });

      const tables = await TableRepository.findByRestaurant(testRestaurant.id);

      expect(tables.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findByCapacity', () => {
    it('should find tables by minimum capacity', async () => {
      await createTestTable(testRestaurant.id, { capacity: 2 });
      await createTestTable(testRestaurant.id, { capacity: 4 });
      await createTestTable(testRestaurant.id, { capacity: 6 });

      const largeTables = await TableRepository.findByCapacity(testRestaurant.id, 4);

      expect(largeTables.every(t => t.capacity >= 4)).toBe(true);
    });
  });

  describe('getSections', () => {
    it('should return unique sections', async () => {
      await createTestTable(testRestaurant.id, { section: 'Main', name: 'M1' });
      await createTestTable(testRestaurant.id, { section: 'Main', name: 'M2' });
      await createTestTable(testRestaurant.id, { section: 'Patio', name: 'P1' });

      const sections = await TableRepository.getSections(testRestaurant.id);

      expect(sections).toContain('Main');
      expect(sections).toContain('Patio');
    });
  });
});

describe('GuestRepository', () => {
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;

  beforeEach(async () => {
    await cleanupTestData();
    const testUser = await createTestUser();
    testRestaurant = await createTestRestaurant(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('findByPhone', () => {
    it('should find guest by phone', async () => {
      const created = await createTestGuest(testRestaurant.id);
      const found = await GuestRepository.findByPhone(testRestaurant.id, created.phone);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return undefined for non-existent phone', async () => {
      const found = await GuestRepository.findByPhone(testRestaurant.id, '+15559999999');
      expect(found).toBeUndefined();
    });
  });

  describe('search', () => {
    it('should search guests by name', async () => {
      await createTestGuest(testRestaurant.id, { name: 'John Doe' });
      await createTestGuest(testRestaurant.id, { name: 'Jane Smith' });

      const results = await GuestRepository.search(testRestaurant.id, 'John');

      expect(results.some(g => g.name.includes('John'))).toBe(true);
    });

    it('should search guests by phone', async () => {
      const guest = await createTestGuest(testRestaurant.id);

      const results = await GuestRepository.search(testRestaurant.id, guest.phone.slice(0, 6));

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('incrementVisits', () => {
    it('should increment visit count', async () => {
      const guest = await createTestGuest(testRestaurant.id);
      const initialVisits = guest.total_visits;

      await GuestRepository.incrementVisits(guest.id);

      const updated = await GuestRepository.findById(guest.id);
      expect(updated?.total_visits).toBe(initialVisits + 1);
      expect(updated?.last_visit_at).toBeDefined();
    });
  });

  describe('incrementNoShows', () => {
    it('should increment no-show count', async () => {
      const guest = await createTestGuest(testRestaurant.id);
      const initialNoShows = guest.total_no_shows;

      await GuestRepository.incrementNoShows(guest.id);

      const updated = await GuestRepository.findById(guest.id);
      expect(updated?.total_no_shows).toBe(initialNoShows + 1);
    });
  });

  describe('block/unblock', () => {
    it('should block a guest', async () => {
      const guest = await createTestGuest(testRestaurant.id);

      const blocked = await GuestRepository.block(guest.id, 'No-show policy');

      expect(blocked?.blocked).toBe(true);
      expect(blocked?.blocked_reason).toBe('No-show policy');
    });

    it('should unblock a guest', async () => {
      const guest = await createTestGuest(testRestaurant.id);
      await GuestRepository.block(guest.id, 'Test');

      const unblocked = await GuestRepository.unblock(guest.id);

      expect(unblocked?.blocked).toBe(false);
      expect(unblocked?.blocked_reason).toBeNull();
    });
  });

  describe('getFrequentGuests', () => {
    it('should return guests ordered by visit count', async () => {
      const guest1 = await createTestGuest(testRestaurant.id, { name: 'Frequent' });
      const guest2 = await createTestGuest(testRestaurant.id, { name: 'Regular' });

      await GuestRepository.incrementVisits(guest1.id);
      await GuestRepository.incrementVisits(guest1.id);
      await GuestRepository.incrementVisits(guest1.id);

      const frequent = await GuestRepository.getFrequentGuests(testRestaurant.id, 10);

      expect(frequent[0]?.name).toBe('Frequent');
    });
  });
});
