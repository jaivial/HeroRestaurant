import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { testConnection } from './database/connection';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { restaurantRoutes } from './routes/restaurant.routes';
import { errorHandler } from './middleware/error.middleware';

console.log('🚀 Starting HeroRestaurant Backend...');

// Test database connection
await testConnection();

const app = new Elysia()
  // CORS
  .use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }))

  // Global error handler
  .onError(errorHandler)

  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // API routes
  .group('/api', (app) => app
    .use(authRoutes)
    .use(userRoutes)
    .use(restaurantRoutes)
  )

  // 404 handler
  .onError(({ code }) => {
    if (code === 'NOT_FOUND') {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found',
        },
      };
    }
  })

  .listen(env.PORT);

console.log(`✓ Server running at http://localhost:${app.server?.port}`);
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
console.log('  GET    /api/restaurants/:id/members');
console.log('  POST   /api/restaurants/:id/members');
console.log('  PATCH  /api/restaurants/:id/members/:memberId');
console.log('  DELETE /api/restaurants/:id/members/:memberId');
console.log('\n✓ Backend ready for requests\n');

export type App = typeof app;
