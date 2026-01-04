import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { treaty } from '@elysiajs/eden';
import type { App } from '../../index';
import { createTestUser, cleanupTestData } from '../utils/test-helpers';

const API_URL = 'http://localhost:3000';

describe('Auth Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      email: 'auth-test@example.com',
      password: 'Test123!@#',
      name: 'Auth Test User',
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'NewUser123!@#',
          name: 'New User',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('newuser@example.com');
      expect(data.data.user.name).toBe('New User');
      expect(data.data.session).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'Test123!@#',
          name: 'Duplicate User',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Test123!@#',
          name: 'Test User',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(testUser.email);
      expect(data.data.session).toBeDefined();
      expect(data.data.session.id).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid session', async () => {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginResponse.json();
      const sessionId = loginData.data.session.id;

      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      const meData = await meResponse.json();

      expect(meResponse.status).toBe(200);
      expect(meData.success).toBe(true);
      expect(meData.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid session', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': 'Session invalid-session-id',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginResponse.json();
      const sessionId = loginData.data.session.id;

      const logoutResponse = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      const logoutData = await logoutResponse.json();

      expect(logoutResponse.status).toBe(200);
      expect(logoutData.success).toBe(true);

      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Session ${sessionId}`,
        },
      });

      expect(meResponse.status).toBe(401);
    });
  });
});
