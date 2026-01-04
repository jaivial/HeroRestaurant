import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestWebSocketClient } from '../utils/ws-client';
import { createTestUser, createTestRestaurant, createTestSession, cleanupTestData } from '../utils/test-helpers';

describe('Menu WebSocket Handlers', () => {
  let wsClient: TestWebSocketClient;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testRestaurant: Awaited<ReturnType<typeof createTestRestaurant>>;
  let sessionId: string;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    testRestaurant = await createTestRestaurant(testUser.id);
    sessionId = await createTestSession(testUser.id);

    wsClient = new TestWebSocketClient();
    await wsClient.connect();
    await wsClient.authenticate(sessionId);
  });

  afterEach(async () => {
    wsClient.disconnect();
    await cleanupTestData();
  });

  describe('menu.create', () => {
    it('should create a fixed price menu', async () => {
      const menuData = {
        restaurantId: testRestaurant.id,
        title: 'Test Menu',
        type: 'fixed_price',
        price: 19.99,
        drinkIncluded: true,
        coffeeIncluded: false,
        availability: {
          breakfast: [],
          lunch: ['monday', 'tuesday'],
          dinner: [],
        },
      };

      const result = await wsClient.send('menu', 'create', menuData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Menu');
      expect(result.price).toBe(19.99);
    });

    it('should reject menu creation without permission', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherSession = await createTestSession(otherUser.id);

      const otherWsClient = new TestWebSocketClient();
      await otherWsClient.connect();
      await otherWsClient.authenticate(otherSession);

      await expect(
        otherWsClient.send('menu', 'create', {
          restaurantId: testRestaurant.id,
          title: 'Unauthorized Menu',
          type: 'fixed_price',
        })
      ).rejects.toThrow();

      otherWsClient.disconnect();
    });
  });

  describe('menu.list', () => {
    it('should list menus for restaurant', async () => {
      await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Menu 1',
        type: 'fixed_price',
        price: 15.99,
        sections: [],
      });

      await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Menu 2',
        type: 'fixed_price',
        price: 22.99,
        sections: [],
      });

      const menus = await wsClient.send('menu', 'list', {
        restaurantId: testRestaurant.id,
      });

      expect(Array.isArray(menus)).toBe(true);
      expect(menus.length).toBe(2);
      expect(menus.some((m: any) => m.title === 'Menu 1')).toBe(true);
      expect(menus.some((m: any) => m.title === 'Menu 2')).toBe(true);
    });

    it('should return empty array for restaurant with no menus', async () => {
      const menus = await wsClient.send('menu', 'list', {
        restaurantId: testRestaurant.id,
      });

      expect(Array.isArray(menus)).toBe(true);
      expect(menus.length).toBe(0);
    });
  });

  describe('menu.get', () => {
    it('should get menu by id with sections and dishes', async () => {
      const created = await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Test Menu',
        type: 'fixed_price',
        price: 19.99,
      });

      const section = await wsClient.send('section', 'create', {
        menuId: created.id,
        menuType: 'fixed',
        name: 'Starters',
        displayOrder: 0,
      });

      const dish = await wsClient.send('dish', 'create', {
        menuId: created.id,
        menuType: 'fixed',
        sectionId: section.id,
        title: 'Salad',
        description: 'Fresh salad',
        displayOrder: 0,
        allergens: ['gluten'],
      });

      const menu = await wsClient.send('menu', 'get', {
        menuId: created.id,
      });

      expect(menu).toBeDefined();
      expect(menu.id).toBe(created.id);
      expect(menu.sections).toBeDefined();
      expect(menu.sections.length).toBe(1);
      expect(menu.sections[0].dishes.length).toBe(1);
    });

    it('should reject get for non-existent menu', async () => {
      await expect(
        wsClient.send('menu', 'get', {
          menuId: 'non-existent-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('menu.update', () => {
    it('should update menu properties', async () => {
      const created = await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Original Title',
        type: 'fixed_price',
        price: 15.99,
        isActive: false,
      });

      await wsClient.send('menu', 'update', {
        menuId: created.id,
        title: 'Updated Title',
        price: 19.99,
        isActive: true,
      });

      const updated = await wsClient.send('menu', 'get', {
        menuId: created.id,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.price).toBe(19.99);
      expect(updated.isActive).toBe(true);
    });
  });

  describe('menu.delete', () => {
    it('should soft delete menu', async () => {
      const created = await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Test Delete Menu',
        type: 'fixed_price',
      });

      await wsClient.send('menu', 'delete', {
        menuId: created.id,
      });

      const menus = await wsClient.send('menu', 'list', {
        restaurantId: testRestaurant.id,
      });

      expect(menus.find((m: any) => m.id === created.id)).toBeUndefined();
    });
  });

  describe('section.create', () => {
    it('should create menu section', async () => {
      const menu = await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Test Menu',
        type: 'fixed_price',
      });

      const section = await wsClient.send('section', 'create', {
        menuId: menu.id,
        menuType: 'fixed',
        name: 'New Section',
        displayOrder: 0,
      });

      expect(section).toBeDefined();
      expect(section.name).toBe('New Section');
    });
  });

  describe('dish.create', () => {
    it('should create dish in section', async () => {
      const menu = await wsClient.send('menu', 'create', {
        restaurantId: testRestaurant.id,
        title: 'Test Menu',
        type: 'fixed_price',
      });

      const section = await wsClient.send('section', 'create', {
        menuId: menu.id,
        menuType: 'fixed',
        name: 'Mains',
        displayOrder: 0,
      });

      const dish = await wsClient.send('dish', 'create', {
        menuId: menu.id,
        menuType: 'fixed',
        sectionId: section.id,
        title: 'Grilled Chicken',
        description: 'Delicious chicken',
        displayOrder: 0,
        showImage: true,
        showDescription: true,
        openModal: false,
        hasSupplement: false,
        allergens: ['gluten', 'dairy'],
      });

      expect(dish).toBeDefined();
      expect(dish.title).toBe('Grilled Chicken');
      expect(dish.allergens).toEqual(['gluten', 'dairy']);
    });
  });
});
