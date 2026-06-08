const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  BASE_URL: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_STARTER_PRICE_ID: z.string().min(1, 'STRIPE_STARTER_PRICE_ID is required'),
  STRIPE_STARTER_ANNUAL_PRICE_ID: z.string().optional(),
  STRIPE_GROWTH_PRICE_ID: z.string().min(1, 'STRIPE_GROWTH_PRICE_ID is required'),
  STRIPE_GROWTH_ANNUAL_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().min(1, 'STRIPE_ENTERPRISE_PRICE_ID is required'),
  STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: z.string().optional(),
  STRIPE_PAYG_PRICE_ID: z.string().min(1, 'STRIPE_PAYG_PRICE_ID is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_JWT_KEY: z.string().optional(),
  CLERK_ORIGIN: z.string().optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
  EMAIL_FROM_NAME: z.string().min(1, 'EMAIL_FROM_NAME is required'),
  ADMIN_SECRET: z.string().min(1, 'ADMIN_SECRET is required'),
});

let cachedEnv = null;

function loadEnv(source = process.env) {
  cachedEnv = envSchema.parse(source);
  return cachedEnv;
}

function getEnv() {
  return cachedEnv || loadEnv();
}

module.exports = { loadEnv, getEnv };
