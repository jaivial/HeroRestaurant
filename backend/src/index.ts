import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { testConnection } from './database/connection';
import { createWebSocketServer } from './websocket/server';
import { connectionManager } from './websocket/state/connections';

console.log('Starting HeroRestaurant Backend (WebSocket Mode)...');

// Test database connection
await testConnection();

const app = new Elysia()
  // CORS (needed for the initial HTTP upgrade request)
  .use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
    methods: ['GET', 'POST', 'OPTIONS'],
  }))

  // Health check (keep as REST for load balancer probes)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: connectionManager.getStats(),
  }))

  // WebSocket server
  .use(createWebSocketServer())

  .listen(env.PORT);

console.log(`Server running at http://localhost:${app.server?.port}`);
console.log(`WebSocket endpoint: ws://localhost:${app.server?.port}/ws`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`CORS Origin: ${env.CORS_ORIGIN}`);
console.log('\nWebSocket Actions:');
console.log('  auth.register     - Register new user');
console.log('  auth.login        - Login with credentials');
console.log('  auth.logout       - Logout current session');
console.log('  auth.logout-all   - Logout all sessions');
console.log('  auth.me           - Get current user');
console.log('  auth.authenticate - Authenticate with session token');
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
console.log('\nBackend ready for WebSocket connections\n');

export type App = typeof app;
