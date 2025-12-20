import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { testConnection } from './database/connection';
import { createWebSocketServer } from './websocket/server';
import { connectionManager } from './websocket/state/connections';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { restaurantRoutes } from './routes/restaurant.routes';

console.log('Starting HeroRestaurant Backend...');

// Test database connection
await testConnection();

const app = new Elysia()
  // CORS (needed for REST API and WebSocket upgrade)
  .use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }))

  // Health check (for load balancer probes)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: connectionManager.getStats(),
  }))

  // REST API routes
  .use(authRoutes)
  .use(userRoutes)
  .use(restaurantRoutes)

  // WebSocket server (for real-time features after authentication)
  .use(createWebSocketServer())

  .listen(env.PORT);

console.log(`Server running at http://localhost:${app.server?.port}`);
console.log(`WebSocket endpoint: ws://localhost:${app.server?.port}/ws`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`CORS Origin: ${env.CORS_ORIGIN}`);
console.log('\nREST API Endpoints:');
console.log('  POST /auth/register   - Register new user');
console.log('  POST /auth/login      - Login with credentials');
console.log('  POST /auth/logout     - Logout current session');
console.log('  POST /auth/logout-all - Logout all sessions');
console.log('  GET  /auth/me         - Get current user');
console.log('  GET  /auth/sessions   - List all sessions');
console.log('  DELETE /auth/sessions/:id - Revoke a session');
console.log('\nWebSocket Actions (after authentication):');
console.log('  auth.authenticate - Authenticate WebSocket with session token');
console.log('  session.list      - List all sessions');
console.log('  session.revoke    - Revoke a specific session');
console.log('  user.get          - Get user profile');
console.log('  user.update       - Update user profile');
console.log('  restaurant.create - Create restaurant');
console.log('  restaurant.list   - List restaurants');
console.log('  restaurant.get    - Get restaurant');
console.log('  restaurant.update - Update restaurant');
console.log('  restaurant.delete - Delete restaurant');
console.log('  member.list       - List members');
console.log('  member.invite     - Invite member');
console.log('  member.update     - Update member');
console.log('  member.remove     - Remove member');
console.log('  system.ping       - Heartbeat ping');
console.log('\nBackend ready\n');

export type App = typeof app;
