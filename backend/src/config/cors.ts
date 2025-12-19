import { env } from './env';

export const corsHeaders = {
  'Access-Control-Allow-Origin': env.CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};
