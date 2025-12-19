import { Hono } from 'hono';
import { AuthHandler } from '../handlers/auth.handler';
import { sessionMiddleware } from '../middleware/session.middleware';
import { loginRateLimit } from '../middleware/rate-limit.middleware';

const auth = new Hono();

// Public routes
auth.post('/register', loginRateLimit(), AuthHandler.register);
auth.post('/login', loginRateLimit(), AuthHandler.login);

// Protected routes
auth.use('/*', sessionMiddleware);
auth.post('/logout', AuthHandler.logout);
auth.post('/logout-all', AuthHandler.logoutAll);
auth.get('/me', AuthHandler.me);
auth.get('/sessions', AuthHandler.sessions);
auth.delete('/sessions/:id', AuthHandler.revokeSession);

export { auth };
