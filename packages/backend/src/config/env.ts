import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DEV_LOGIN_KEY: z.string().optional().default('dev-secret-key-1234'),
  OTP_PROVIDER: z.string().default('none'),
  OTP_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables configuration:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment configuration');
}

export const env = _env.data;
