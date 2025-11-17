import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),

  // SMS
  SMS_PROVIDER: z.string().default('twilio'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('10485760'),
  ALLOWED_FILE_TYPES: z.string(),

  // Encryption
  ENCRYPTION_KEY: z.string(),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-gcm'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_DIR: z.string().default('./logs'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT),
  SMTP_PORT: parseInt(parsed.data.SMTP_PORT),
  SMTP_SECURE: parsed.data.SMTP_SECURE === 'true',
  MAX_FILE_SIZE: parseInt(parsed.data.MAX_FILE_SIZE),
  RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX_REQUESTS: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS),
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};

export default env;
