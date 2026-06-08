const { loadEnv } = require('../../src/config/env');

describe('env validation', () => {
  it('throws when Stripe and DB keys are missing', () => {
    expect(() => loadEnv({
      DATABASE_URL: '',
      REDIS_URL: '',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      STRIPE_STARTER_PRICE_ID: '',
      STRIPE_GROWTH_PRICE_ID: '',
      STRIPE_ENTERPRISE_PRICE_ID: '',
      STRIPE_PAYG_PRICE_ID: '',
      CLERK_SECRET_KEY: '',
      RESEND_API_KEY: '',
      EMAIL_FROM: '',
      EMAIL_FROM_NAME: '',
      ADMIN_SECRET: '',
    })).toThrow();
  });

  it('accepts a complete config', () => {
    expect(() => loadEnv({
      DATABASE_URL: 'postgresql://localhost/test',
      REDIS_URL: 'redis://localhost:6379',
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      STRIPE_STARTER_PRICE_ID: 'price_1',
      STRIPE_GROWTH_PRICE_ID: 'price_2',
      STRIPE_ENTERPRISE_PRICE_ID: 'price_3',
      STRIPE_PAYG_PRICE_ID: 'price_4',
      CLERK_SECRET_KEY: 'sk_test',
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'noreply@example.com',
      EMAIL_FROM_NAME: 'VoiceAgent',
      ADMIN_SECRET: 'secret',
    })).not.toThrow();
  });
});
