import app from './routes';
import { env } from './config/env';
import { testConnection } from './database/connection';

console.log('🚀 Starting HeroRestaurant Backend...');

// Test database connection
await testConnection();

// Start server
const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  },
});

console.log(`✓ Server running at http://localhost:${server.port}`);
console.log(`✓ Environment: ${env.NODE_ENV}`);
console.log(`✓ CORS Origin: ${env.CORS_ORIGIN}`);
console.log('\nAvailable routes:');
console.log('  POST   /api/auth/register');
console.log('  POST   /api/auth/login');
console.log('  POST   /api/auth/logout');
console.log('  POST   /api/auth/logout-all');
console.log('  GET    /api/auth/me');
console.log('  GET    /api/auth/sessions');
console.log('  DELETE /api/auth/sessions/:id');
console.log('  GET    /api/users/me');
console.log('  PATCH  /api/users/me');
console.log('  POST   /api/restaurants');
console.log('  GET    /api/restaurants');
console.log('  GET    /api/restaurants/:id');
console.log('  PATCH  /api/restaurants/:id');
console.log('  DELETE /api/restaurants/:id');
console.log('  GET    /api/restaurants/:restaurantId/members');
console.log('  POST   /api/restaurants/:restaurantId/members');
console.log('  PATCH  /api/restaurants/:restaurantId/members/:userId');
console.log('  DELETE /api/restaurants/:restaurantId/members/:userId');
console.log('\n✓ Backend ready for requests\n');
