import { Hono } from 'hono';
import { UserHandler } from '../handlers/user.handler';
import { sessionMiddleware } from '../middleware/session.middleware';

const users = new Hono();

// All user routes require authentication
users.use('/*', sessionMiddleware);

users.get('/me', UserHandler.getMe);
users.patch('/me', UserHandler.updateMe);

export { users };
