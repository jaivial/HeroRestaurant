import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('hero_restaurant'),

  // Security
  SESSION_SECRET: z.string().min(32),
  HASH_SECRET: z.string().min(32),

  // Server
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Cloudflare R2
  R2_ENDPOINT: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string().default('herorestaurant'),
  R2_PUBLIC_URL: z.string(),
});

export const env = envSchema.parse(process.env);
