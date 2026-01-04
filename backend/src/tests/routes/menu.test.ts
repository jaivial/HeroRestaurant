import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestUser, createTestRestaurant, createTestMenu, cleanupTestData } from '../utils/test-helpers';

const API_URL = 'http://localhost:3000';

describe('Menu Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;
  let testMenu: Awaited<ReturnType<typeof createTestMenu>>;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    testRestaurant = await createTestRestaurant(testUser.id);
    testMenu = await createTestMenu(testRestaurant.id, {
      title: 'Test Menu',
      type: 'fixed_price',
      price: 19.99,
      isActive: true,
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/menu/public/:menuId', () => {
    it('should return active menu', async () => {
      const response = await fetch(`${API_URL}/api/menu/public/${testMenu.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testMenu.id);
      expect(data.data.title).toBe(testMenu.title);
      expect(data.data.restaurant.id).toBe(testRestaurant.id);
    });

    it('should return 404 for non-existent menu', async () => {
      const response = await fetch(`${API_URL}/api/menu/public/non-existent-id`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for inactive menu', async () => {
      const inactiveMenu = await createTestMenu(testRestaurant.id, {
        title: 'Inactive Menu',
        isActive: false,
      });

      const response = await fetch(`${API_URL}/api/menu/public/${inactiveMenu.id}`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MENU_INACTIVE');
    });
  });

  describe('POST /api/menu/:menuId/short-url', () => {
    it('should generate short URL for menu', async () => {
      const response = await fetch(`${API_URL}/api/menu/${testMenu.id}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.code).toBeDefined();
      expect(data.data.code.length).toBe(10);
      expect(data.data.shortUrl).toContain('/m/');
      expect(data.data.fullUrl).toContain(testMenu.id);
    });

    it('should return same short URL on multiple requests', async () => {
      const response1 = await fetch(`${API_URL}/api/menu/${testMenu.id}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data1 = await response1.json();

      const response2 = await fetch(`${API_URL}/api/menu/${testMenu.id}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data2 = await response2.json();

      expect(data1.data.code).toBe(data2.data.code);
    });

    it('should return 404 for non-existent menu', async () => {
      const response = await fetch(`${API_URL}/api/menu/non-existent-id/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /m/:code (Short URL Redirect)', () => {
    it('should redirect to full menu URL', async () => {
      const shortUrlResponse = await fetch(`${API_URL}/api/menu/${testMenu.id}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const shortUrlData = await shortUrlResponse.json();
      const code = shortUrlData.data.code;

      const response = await fetch(`${API_URL}/m/${code}`, {
        redirect: 'manual',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(testMenu.id);
      expect(response.headers.get('location')).toContain(testRestaurant.slug);
    });

    it('should return 404 for invalid code', async () => {
      const response = await fetch(`${API_URL}/m/invalidcode`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
