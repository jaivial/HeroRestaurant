import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createTestUser, 
  createTestRestaurant, 
  createTestTable, 
  createTestGuest, 
  createTestBooking, 
  createTestSession,
  cleanupTestData 
} from '../utils/test-helpers';
import { ROLE_ADMIN, RESTAURANT_FEATURES } from '../../constants/permissions';
import crypto from 'crypto';

const API_URL = 'http://localhost:3000';

describe('Booking Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;
  let testTable: Awaited<ReturnType<typeof createTestTable>>;
  let testGuest: Awaited<ReturnType<typeof createTestGuest>>;
  let sessionId: string;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      email: `booking-test-${Date.now()}@example.com`,
      name: 'Booking Test User',
    });
    testRestaurant = await createTestRestaurant(testUser.id, {
      name: `Booking Test Restaurant ${Date.now()}`,
    });
    testTable = await createTestTable(testRestaurant.id, {
      name: 'Test Table 1',
      capacity: 4,
    });
    testGuest = await createTestGuest(testRestaurant.id, {
      name: 'Test Guest',
      phone: `+1555${Date.now().toString().slice(-7)}`,
    });
    sessionId = await createTestSession(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/bookings', () => {
    it('should return bookings for a date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, { date: today });

      const response = await fetch(
        `${API_URL}/api/bookings?startDate=${today}&endDate=${today}`,
        {
          headers: {
            'Authorization': `Session ${sessionId}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_URL}/api/bookings?startDate=${today}&endDate=${today}`
      );

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('should return booking stats', async () => {
      const today = new Date().toISOString().split('T')[0];
      await createTestBooking(testRestaurant.id, { date: today });

      const response = await fetch(
        `${API_URL}/api/bookings/stats?date=${today}`,
        {
          headers: {
            'Authorization': `Session ${sessionId}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(typeof data.data.totalBookings).toBe('number');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return a specific booking', async () => {
      const booking = await createTestBooking(testRestaurant.id);

      const response = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(booking.id);
      expect(data.data.guestName).toBe(booking.guestName);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/non-existent-id`, {
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          guestName: 'New Guest',
          guestPhone: '+1555000000',
          guestEmail: 'newguest@example.com',
          partySize: 2,
          date: today,
          startTime: '19:00',
          duration: 90,
          source: 'phone',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.guestName).toBe('New Guest');
      expect(data.data.status).toBe('pending');
    });

    it('should reject booking with invalid phone number', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          guestName: 'Invalid Guest',
          guestPhone: 'invalid',
          partySize: 2,
          date: today,
          startTime: '19:00',
          source: 'phone',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/status', () => {
    it('should update booking status', async () => {
      const booking = await createTestBooking(testRestaurant.id);

      const response = await fetch(`${API_URL}/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          status: 'confirmed',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('confirmed');
    });

    it('should not allow invalid status transition', async () => {
      const booking = await createTestBooking(testRestaurant.id, {
        status: 'completed',
      });

      const response = await fetch(`${API_URL}/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          status: 'pending',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id/table', () => {
    it('should assign table to booking', async () => {
      const booking = await createTestBooking(testRestaurant.id, {
        tableId: null,
      });

      const response = await fetch(`${API_URL}/api/bookings/${booking.id}/table`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          tableId: testTable.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tableId).toBe(testTable.id);
    });
  });

  describe('GET /api/bookings/waitlist', () => {
    it('should return waitlist entries', async () => {
      const response = await fetch(`${API_URL}/api/bookings/waitlist`, {
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/bookings/waitlist', () => {
    it('should add guest to waitlist', async () => {
      const response = await fetch(`${API_URL}/api/bookings/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionId}`,
        },
        body: JSON.stringify({
          guestName: 'Waitlist Guest',
          guestPhone: '+1555999999',
          partySize: 4,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.guestName).toBe('Waitlist Guest');
      expect(data.data.status).toBe('waiting');
    });
  });

  describe('GET /api/bookings/guests/search', () => {
    it('should search guests', async () => {
      const response = await fetch(
        `${API_URL}/api/bookings/guests/search?q=Test`,
        {
          headers: {
            'Authorization': `Session ${sessionId}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
