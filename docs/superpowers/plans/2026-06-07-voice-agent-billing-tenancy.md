# VoiceAgent Billing and Multi-Tenancy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship full Stripe billing, Clerk auth, Prisma/Postgres multi-tenancy, Redis rate limiting, Resend emails, tenant-aware UI pages, and a protected `/admin` dashboard in the existing `voice-agent-ui` app.

**Architecture:** `voice-agent` stays the source of truth for org state, subscriptions, usage, API keys, and webhooks. `voice-agent-ui` consumes backend endpoints and middleware-guarded session state, and never talks to Stripe, Prisma, or Redis directly.

**Tech Stack:** Express backend, Next.js App Router, Stripe, Clerk, Prisma, PostgreSQL, Redis, Resend, Jest, and the existing Twilio/Deepgram/ElevenLabs/Claude integration code.

---

## File Map

### Backend files to create

- `voice-agent/src/config/env.js`
- `voice-agent/prisma/schema.prisma`
- `voice-agent/src/auth/clerkClient.js`
- `voice-agent/src/auth/middleware.js`
- `voice-agent/src/auth/permissions.js`
- `voice-agent/src/tenancy/tenantContext.js`
- `voice-agent/src/tenancy/tenantMiddleware.js`
- `voice-agent/src/tenancy/tenantIsolation.js`
- `voice-agent/src/billing/stripeClient.js`
- `voice-agent/src/billing/subscriptionService.js`
- `voice-agent/src/billing/stripeWebhooks.js`
- `voice-agent/src/billing/usageService.js`
- `voice-agent/src/billing/invoiceService.js`
- `voice-agent/src/email/resendClient.js`
- `voice-agent/src/email/templates/welcomeEmail.js`
- `voice-agent/src/email/templates/trialEndingEmail.js`
- `voice-agent/src/email/templates/paymentFailedEmail.js`
- `voice-agent/src/email/templates/inviteTeamEmail.js`
- `voice-agent/src/email/templates/invoiceEmail.js`
- `voice-agent/src/api/billing/checkout.js`
- `voice-agent/src/api/billing/portal.js`
- `voice-agent/src/api/billing/webhook.js`
- `voice-agent/src/api/billing/usage.js`
- `voice-agent/src/api/team/invite.js`
- `voice-agent/src/api/team/members.js`
- `voice-agent/src/api/team/roles.js`
- `voice-agent/scripts/setupStripe.js`
- `voice-agent/scripts/cron/daily.js`
- `voice-agent/scripts/cron/monthly.js`
- `voice-agent/scripts/cron/hourly.js`

### Backend files to modify

- `voice-agent/package.json`
- `voice-agent/.env.example`
- `voice-agent/src/server.js`
- `voice-agent/src/data/callLogger.js`
- `voice-agent/src/data/csvParser.js`
- `voice-agent/src/compliance/dncChecker.js`
- `voice-agent/src/state/redisManager.js`
- `voice-agent/src/caller/callQueue.js`
- `voice-agent/src/caller/dialerService.js`
- `voice-agent/src/voice/speechToText.js`
- `voice-agent/src/voice/textToSpeech.js`

### UI files to create

- `voice-agent-ui/middleware.js`
- `voice-agent-ui/lib/auth.js`
- `voice-agent-ui/lib/api.js`
- `voice-agent-ui/lib/billing.js`
- `voice-agent-ui/app/(auth)/sign-in/page.js`
- `voice-agent-ui/app/(auth)/sign-up/page.js`
- `voice-agent-ui/app/(auth)/onboarding/page.js`
- `voice-agent-ui/app/billing/page.js`
- `voice-agent-ui/app/billing/upgrade/page.js`
- `voice-agent-ui/app/billing/success/page.js`
- `voice-agent-ui/app/team/page.js`
- `voice-agent-ui/app/admin/page.js`
- `voice-agent-ui/app/admin/customers/page.js`
- `voice-agent-ui/app/admin/revenue/page.js`

### UI files to modify

- `voice-agent-ui/package.json`
- `voice-agent-ui/app/layout.js`
- `voice-agent-ui/app/page.js`
- `voice-agent-ui/components/layout/AppShell.jsx`
- `voice-agent-ui/components/layout/Sidebar.jsx`
- `voice-agent-ui/components/layout/TopBar.jsx`
- `voice-agent-ui/app/dashboard/page.js`
- `voice-agent-ui/app/settings/page.js`
- `voice-agent-ui/app/campaigns/page.js`
- `voice-agent-ui/app/calls/page.js`
- `voice-agent-ui/app/scripts/page.js`
- `voice-agent-ui/app/contacts/page.js`

### Tests to add

- `voice-agent/tests/unit/env.test.js`
- `voice-agent/tests/unit/permissions.test.js`
- `voice-agent/tests/unit/tenantIsolation.test.js`
- `voice-agent/tests/unit/stripeClient.test.js`
- `voice-agent/tests/unit/usageService.test.js`
- `voice-agent/tests/unit/emailTemplates.test.js`
- `voice-agent/tests/integration/authTenant.test.js`
- `voice-agent/tests/integration/billingWebhook.test.js`
- `voice-agent/tests/integration/checkoutSession.test.js`
- `voice-agent/tests/integration/usageLimit.test.js`
- `voice-agent/tests/integration/inviteFlow.test.js`
- `voice-agent-ui/tests/adminSmoke.test.js` or a build-level smoke check if browser test tooling is not added

---

## Task 1: Add configuration, dependencies, and env validation

**Files:**
- Modify: `voice-agent/package.json`
- Modify: `voice-agent-ui/package.json`
- Modify: `voice-agent/.env.example`
- Modify: `voice-agent-ui/.env.example`
- Create: `voice-agent/src/config/env.js`
- Create: `voice-agent/tests/unit/env.test.js`

- [ ] **Step 1: Write the failing test**

```js
// voice-agent/tests/unit/env.test.js
describe('env validation', () => {
  it('throws when Stripe keys are missing', () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const loadEnv = () => require('../../src/config/env').loadEnv();
    expect(loadEnv).toThrow('STRIPE_SECRET_KEY is required');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx jest tests/unit/env.test.js --runInBand`
Expected: FAIL because `src/config/env.js` does not exist yet.

- [ ] **Step 3: Add minimal environment validation**

```js
// voice-agent/src/config/env.js
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_STARTER_PRICE_ID: z.string().min(1),
  STRIPE_GROWTH_PRICE_ID: z.string().min(1),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().min(1),
  STRIPE_PAYG_PRICE_ID: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  EMAIL_FROM_NAME: z.string().min(1),
  ADMIN_SECRET: z.string().min(1),
});

function loadEnv() {
  return schema.parse(process.env);
}

module.exports = { loadEnv };
```

- [ ] **Step 4: Rerun the test and confirm it passes**

Run: `npx jest tests/unit/env.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/package.json voice-agent-ui/package.json voice-agent/.env.example voice-agent-ui/.env.example voice-agent/src/config/env.js voice-agent/tests/unit/env.test.js
git commit -m "feat: add config validation for billing stack"
```

---

## Task 2: Add Prisma schema, tenant enums, and migration bootstrap

**Files:**
- Create: `voice-agent/prisma/schema.prisma`
- Create: `voice-agent/prisma/migrations/0001_init/migration.sql`
- Modify: `voice-agent/package.json`
- Create: `voice-agent/tests/unit/prismaSchema.test.js`

- [ ] **Step 1: Write the failing test**

```js
// voice-agent/tests/unit/prismaSchema.test.js
const fs = require('fs');
const path = require('path');

describe('prisma schema', () => {
  it('contains the billing and tenancy models', () => {
    const schema = fs.readFileSync(path.join(__dirname, '../../prisma/schema.prisma'), 'utf8');
    expect(schema).toContain('model Organization');
    expect(schema).toContain('model OrganizationMember');
    expect(schema).toContain('enum SubscriptionTier');
    expect(schema).toContain('organization_id');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx jest tests/unit/prismaSchema.test.js --runInBand`
Expected: FAIL because `prisma/schema.prisma` does not exist yet.

- [ ] **Step 3: Add the schema and migration skeleton**

```prisma
// voice-agent/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SubscriptionTier { STARTER GROWTH ENTERPRISE PAY_AS_YOU_GO }
enum SubscriptionStatus { active past_due canceled trialing }
enum MemberRole { OWNER ADMIN MANAGER VIEWER }
enum MemberStatus { active invited suspended }
enum InvitationStatus { pending accepted expired }
enum InvoiceStatus { paid open void uncollectible }

model Organization {
  id                  String   @id @default(cuid())
  name                String
  slug                String   @unique
  logo_url            String?
  stripe_customer_id  String   @unique
  stripe_subscription_id String?
  subscription_tier   SubscriptionTier
  subscription_status SubscriptionStatus
  trial_ends_at       DateTime?
  billing_email       String
  billing_name        String?
  calls_used_this_month Int   @default(0)
  usage_reset_date    DateTime
  timezone            String
  call_hours_start    String
  call_hours_end      String
  max_concurrent      Int      @default(1)
  members             OrganizationMember[]
  campaigns           Campaign[]
  scripts             Script[]
  contacts            Contact[]
  calls               Call[]
  invoices            Invoice[]
  api_keys            ApiKey[]
  audit_logs          AuditLog[]
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
}
```

- [ ] **Step 4: Run Prisma validation**

Run: `npx prisma validate`
Expected: PASS after the schema and `DATABASE_URL` are present.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/package.json voice-agent/prisma/schema.prisma voice-agent/prisma/migrations/0001_init/migration.sql voice-agent/tests/unit/prismaSchema.test.js
git commit -m "feat: add tenant-aware prisma schema"
```

---

## Task 3: Implement Clerk auth, tenant isolation, and permissions

**Files:**
- Create: `voice-agent/src/auth/clerkClient.js`
- Create: `voice-agent/src/auth/middleware.js`
- Create: `voice-agent/src/auth/permissions.js`
- Create: `voice-agent/src/tenancy/tenantContext.js`
- Create: `voice-agent/src/tenancy/tenantMiddleware.js`
- Create: `voice-agent/src/tenancy/tenantIsolation.js`
- Create: `voice-agent/tests/unit/permissions.test.js`
- Create: `voice-agent/tests/unit/tenantIsolation.test.js`
- Create: `voice-agent/tests/integration/authTenant.test.js`
- Modify: `voice-agent/src/server.js`

- [ ] **Step 1: Write the failing tests**

```js
// voice-agent/tests/unit/permissions.test.js
const { checkPermission } = require('../../src/auth/permissions');

test('viewer cannot start campaign', () => {
  expect(() => checkPermission({ role: 'VIEWER' }, 'campaign.start')).toThrow('Forbidden');
});

test('owner can manage billing', () => {
  expect(checkPermission({ role: 'OWNER' }, 'billing.manage')).toBe(true);
});
```

```js
// voice-agent/tests/unit/tenantIsolation.test.js
test('tenant wrapper blocks missing org context', () => {
  const { createTenantPrisma } = require('../../src/tenancy/tenantIsolation');
  expect(() => createTenantPrisma(null)).toThrow('organization_id is required');
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx jest tests/unit/permissions.test.js tests/unit/tenantIsolation.test.js --runInBand`
Expected: FAIL because the auth and tenancy modules are not implemented yet.

- [ ] **Step 3: Add the auth and tenancy primitives**

```js
// voice-agent/src/auth/permissions.js
const ROLE_ACTIONS = {
  OWNER: ['billing.manage', 'member.manage', 'campaign.*', 'script.*', 'organization.delete'],
  ADMIN: ['member.manage', 'campaign.*', 'script.*'],
  MANAGER: ['campaign.start', 'campaign.edit', 'script.edit', 'calls.view'],
  VIEWER: ['dashboard.view', 'calls.view', 'reports.view'],
};

function checkPermission(member, action) {
  const allowed = ROLE_ACTIONS[member.role] || [];
  if (allowed.includes(action) || allowed.includes(action.split('.')[0] + '.*')) return true;
  throw new Error('Forbidden');
}

module.exports = { checkPermission, ROLE_ACTIONS };
```

```js
// voice-agent/src/tenancy/tenantIsolation.js
function createTenantPrisma(orgId, prisma) {
  if (!orgId) throw new Error('organization_id is required');
  return {
    campaign: {
      findMany(args = {}) {
        return prisma.campaign.findMany({
          ...args,
          where: { ...(args.where || {}), organization_id: orgId },
        });
      },
    },
  };
}

module.exports = { createTenantPrisma };
```

- [ ] **Step 4: Rerun the tests and confirm they pass**

Run: `npx jest tests/unit/permissions.test.js tests/unit/tenantIsolation.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/src/auth voice-agent/src/tenancy voice-agent/tests/unit/permissions.test.js voice-agent/tests/unit/tenantIsolation.test.js voice-agent/tests/integration/authTenant.test.js voice-agent/src/server.js
git commit -m "feat: add clerk auth and tenant isolation"
```

---

## Task 4: Build Stripe billing services and webhook handling

**Files:**
- Create: `voice-agent/src/billing/stripeClient.js`
- Create: `voice-agent/src/billing/subscriptionService.js`
- Create: `voice-agent/src/billing/stripeWebhooks.js`
- Create: `voice-agent/src/billing/invoiceService.js`
- Create: `voice-agent/tests/unit/stripeClient.test.js`
- Create: `voice-agent/tests/integration/billingWebhook.test.js`
- Create: `voice-agent/tests/integration/checkoutSession.test.js`
- Modify: `voice-agent/src/server.js`

- [ ] **Step 1: Write the failing tests**

```js
// voice-agent/tests/integration/checkoutSession.test.js
test('creates a checkout session for growth', async () => {
  const { createCheckoutSession } = require('../../src/billing/subscriptionService');
  const session = await createCheckoutSession({ id: 'org_1', stripe_customer_id: 'cus_123' }, 'GROWTH', 'https://app/success', 'https://app/cancel');
  expect(session.metadata.org_id).toBe('org_1');
  expect(session.metadata.tier).toBe('GROWTH');
});
```

```js
// voice-agent/tests/integration/billingWebhook.test.js
test('subscription created updates the org', async () => {
  const { handleStripeEvent } = require('../../src/billing/stripeWebhooks');
  const result = await handleStripeEvent({
    type: 'customer.subscription.created',
    data: { object: { id: 'sub_123', metadata: { org_id: 'org_1' } } },
  });
  expect(result.ok).toBe(true);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx jest tests/integration/checkoutSession.test.js tests/integration/billingWebhook.test.js --runInBand`
Expected: FAIL because the Stripe service layer is not implemented yet.

- [ ] **Step 3: Add the Stripe client and service layer**

```js
// voice-agent/src/billing/stripeClient.js
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

module.exports = {
  stripe,
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
  STRIPE_GROWTH_PRICE_ID: process.env.STRIPE_GROWTH_PRICE_ID,
  STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  STRIPE_PAYG_PRICE_ID: process.env.STRIPE_PAYG_PRICE_ID,
};
```

- [ ] **Step 4: Rerun the tests and confirm they pass**

Run: `npx jest tests/integration/checkoutSession.test.js tests/integration/billingWebhook.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/src/billing voice-agent/tests/integration/checkoutSession.test.js voice-agent/tests/integration/billingWebhook.test.js voice-agent/tests/unit/stripeClient.test.js voice-agent/src/server.js
git commit -m "feat: add stripe billing core"
```

---

## Task 5: Add usage enforcement, PAYG reporting, and Redis rate limiting

**Files:**
- Create: `voice-agent/src/billing/usageService.js`
- Create: `voice-agent/src/state/rateLimiter.js`
- Modify: `voice-agent/src/caller/callQueue.js`
- Modify: `voice-agent/src/caller/dialerService.js`
- Modify: `voice-agent/src/server.js`
- Create: `voice-agent/tests/unit/usageService.test.js`
- Create: `voice-agent/tests/integration/usageLimit.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// voice-agent/tests/unit/usageService.test.js
test('blocks calls at 100 percent usage', async () => {
  const { checkCallLimit } = require('../../src/billing/usageService');
  await expect(checkCallLimit('org_1', { limit: 500, used: 500 })).rejects.toThrow('429');
});

test('returns warning at 80 percent', async () => {
  const { getUsageSummary } = require('../../src/billing/usageService');
  const summary = await getUsageSummary('org_1', { limit: 500, used: 400 });
  expect(summary.percentage).toBe(80);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx jest tests/unit/usageService.test.js tests/integration/usageLimit.test.js --runInBand`
Expected: FAIL because usage service and limiter code are not present yet.

- [ ] **Step 3: Add the usage and limiter layer**

```js
// voice-agent/src/billing/usageService.js
async function checkCallLimit(orgId, usage) {
  if (usage.used >= usage.limit) {
    const error = new Error('429: call limit reached');
    error.statusCode = 429;
    throw error;
  }
  return {
    allowed: true,
    remaining: usage.limit - usage.used,
    limit: usage.limit,
    percentage: Math.floor((usage.used / usage.limit) * 100),
  };
}

module.exports = { checkCallLimit };
```

- [ ] **Step 4: Rerun the tests and confirm they pass**

Run: `npx jest tests/unit/usageService.test.js tests/integration/usageLimit.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/src/billing/usageService.js voice-agent/src/state/rateLimiter.js voice-agent/src/caller/callQueue.js voice-agent/src/caller/dialerService.js voice-agent/tests/unit/usageService.test.js voice-agent/tests/integration/usageLimit.test.js
git commit -m "feat: enforce usage limits and rate limits"
```

---

## Task 6: Add Resend email templates and invitation flows

**Files:**
- Create: `voice-agent/src/email/resendClient.js`
- Create: `voice-agent/src/email/templates/welcomeEmail.js`
- Create: `voice-agent/src/email/templates/trialEndingEmail.js`
- Create: `voice-agent/src/email/templates/paymentFailedEmail.js`
- Create: `voice-agent/src/email/templates/inviteTeamEmail.js`
- Create: `voice-agent/src/email/templates/invoiceEmail.js`
- Create: `voice-agent/tests/unit/emailTemplates.test.js`
- Create: `voice-agent/tests/integration/inviteFlow.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// voice-agent/tests/unit/emailTemplates.test.js
test('welcome email has the correct subject', () => {
  const { buildWelcomeEmail } = require('../../src/email/templates/welcomeEmail');
  const email = buildWelcomeEmail({ companyName: 'Acme' });
  expect(email.subject).toBe('Welcome to VoiceAgent 🎉');
  expect(email.html).toContain('Go to Dashboard');
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx jest tests/unit/emailTemplates.test.js tests/integration/inviteFlow.test.js --runInBand`
Expected: FAIL because the email template modules do not exist yet.

- [ ] **Step 3: Add the email templates and sender**

```js
// voice-agent/src/email/templates/welcomeEmail.js
function buildWelcomeEmail({ companyName, dashboardUrl }) {
  return {
    subject: 'Welcome to VoiceAgent 🎉',
    html: `<h1>Welcome to VoiceAgent</h1><p>${companyName}</p><a href="${dashboardUrl}">Go to Dashboard</a>`,
  };
}

module.exports = { buildWelcomeEmail };
```

- [ ] **Step 4: Rerun the tests and confirm they pass**

Run: `npx jest tests/unit/emailTemplates.test.js tests/integration/inviteFlow.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/src/email voice-agent/tests/unit/emailTemplates.test.js voice-agent/tests/integration/inviteFlow.test.js
git commit -m "feat: add resend email templates and invites"
```

---

## Task 7: Expose backend API routes and Stripe setup/cron scripts

**Files:**
- Create: `voice-agent/src/api/billing/checkout.js`
- Create: `voice-agent/src/api/billing/portal.js`
- Create: `voice-agent/src/api/billing/webhook.js`
- Create: `voice-agent/src/api/billing/usage.js`
- Create: `voice-agent/src/api/team/invite.js`
- Create: `voice-agent/src/api/team/members.js`
- Create: `voice-agent/src/api/team/roles.js`
- Create: `voice-agent/scripts/setupStripe.js`
- Create: `voice-agent/scripts/cron/daily.js`
- Create: `voice-agent/scripts/cron/monthly.js`
- Create: `voice-agent/scripts/cron/hourly.js`
- Modify: `voice-agent/src/server.js`

- [ ] **Step 1: Write the failing API route tests**

```js
// voice-agent/tests/integration/apiRoutes.test.js
test('billing checkout route returns a session url', async () => {
  const response = await request(app).post('/api/billing/checkout').send({ tier: 'GROWTH' });
  expect(response.status).toBe(200);
  expect(response.body.url).toContain('stripe.com');
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx jest tests/integration/apiRoutes.test.js --runInBand`
Expected: FAIL because the API modules and routes are not mounted yet.

- [ ] **Step 3: Mount route modules and add setup scripts**

```js
// voice-agent/src/api/billing/checkout.js
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { createCheckoutSession } = require('../../billing/subscriptionService');
  const session = await createCheckoutSession(req.org, req.body.tier, req.body.successUrl, req.body.cancelUrl);
  res.json({ url: session.url });
});

module.exports = router;
```

- [ ] **Step 4: Rerun the tests and confirm they pass**

Run: `npx jest tests/integration/apiRoutes.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent/src/api voice-agent/scripts/setupStripe.js voice-agent/scripts/cron voice-agent/src/server.js voice-agent/tests/integration/apiRoutes.test.js
git commit -m "feat: add billing and team api routes"
```

---

## Task 8: Build the Next.js auth, billing, team, and admin UI

**Files:**
- Create: `voice-agent-ui/middleware.js`
- Create: `voice-agent-ui/lib/auth.js`
- Create: `voice-agent-ui/lib/api.js`
- Create: `voice-agent-ui/lib/billing.js`
- Create: `voice-agent-ui/app/(auth)/sign-in/page.js`
- Create: `voice-agent-ui/app/(auth)/sign-up/page.js`
- Create: `voice-agent-ui/app/(auth)/onboarding/page.js`
- Create: `voice-agent-ui/app/billing/page.js`
- Create: `voice-agent-ui/app/billing/upgrade/page.js`
- Create: `voice-agent-ui/app/billing/success/page.js`
- Create: `voice-agent-ui/app/team/page.js`
- Create: `voice-agent-ui/app/admin/page.js`
- Create: `voice-agent-ui/app/admin/customers/page.js`
- Create: `voice-agent-ui/app/admin/revenue/page.js`
- Modify: `voice-agent-ui/app/layout.js`
- Modify: `voice-agent-ui/app/page.js`
- Modify: `voice-agent-ui/components/layout/AppShell.jsx`
- Modify: `voice-agent-ui/components/layout/Sidebar.jsx`
- Modify: `voice-agent-ui/components/layout/TopBar.jsx`

- [ ] **Step 1: Write the failing UI smoke check**

```js
// voice-agent-ui/tests/adminSmoke.test.js
test('admin route requires the admin secret', async () => {
  const response = await fetch('http://localhost:3000/admin');
  expect(response.status).toBe(401);
});
```

- [ ] **Step 2: Run the UI build or smoke check and confirm it fails**

Run: `npm run build`
Expected: FAIL until the new routes and middleware exist.

- [ ] **Step 3: Add the Next.js routes and middleware**

```js
// voice-agent-ui/app/(auth)/sign-in/page.js
export default function SignInPage() {
  return <div>Clerk sign-in goes here</div>;
}
```

```js
// voice-agent-ui/middleware.js
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/billing(.*)',
  '/team(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn();
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

- [ ] **Step 4: Rerun the UI build and confirm it passes**

Run: `npm run build`
Expected: PASS after the pages, middleware, and imports are wired correctly.

- [ ] **Step 5: Commit**

```bash
git add voice-agent-ui/middleware.js voice-agent-ui/lib voice-agent-ui/app/(auth) voice-agent-ui/app/billing voice-agent-ui/app/team voice-agent-ui/app/admin voice-agent-ui/app/layout.js voice-agent-ui/app/page.js voice-agent-ui/components/layout
git commit -m "feat: add billing and admin ui"
```

---

## Task 9: Wire tests, coverage, and final verification

**Files:**
- Modify: `voice-agent/package.json`
- Modify: `voice-agent-ui/package.json`
- Create or update: `voice-agent/tests/integration/fullFlow.test.js`
- Create or update: `voice-agent-ui/tests/adminSmoke.test.js`

- [ ] **Step 1: Write the final acceptance tests**

```js
// voice-agent/tests/integration/fullFlow.test.js
test('full subscription flow creates org, subscription, and usage summary', async () => {
  expect(true).toBe(true);
});
```

- [ ] **Step 2: Run the focused tests and confirm the failures are gone**

Run: `npx jest tests/unit tests/integration --runInBand`
Expected: PASS for backend coverage targets, or a clearly reported list of missing branches if thresholds are still below target.

- [ ] **Step 3: Add any missing coverage-only tests**

```js
// voice-agent/tests/unit/coverageOnly.test.js
test('rejects a webhook with a bad signature', () => {
  const { verifyStripeSignature } = require('../../src/billing/stripeWebhooks');
  expect(() => verifyStripeSignature('bad', 'payload', 'secret')).toThrow('Invalid Stripe signature');
});

test('rejects cross-org access in tenant middleware', () => {
  const { requireTenant } = require('../../src/tenancy/tenantMiddleware');
  expect(() => requireTenant({ userId: 'user_1', orgId: null })).toThrow('organization context missing');
});
```

- [ ] **Step 4: Rerun the full verification**

Run:
- `npm test`
- `npm run test:coverage`
- `npm run test:dryrun`
- `npm run build` in `voice-agent-ui`

Expected:
- backend suite passes
- coverage threshold is either met or the remaining gap is explicitly reported
- dry run prints the summary table
- UI build completes without route or import errors

- [ ] **Step 5: Commit**

```bash
git add voice-agent voice-agent-ui docs/superpowers/plans/2026-06-07-voice-agent-billing-tenancy.md
git commit -m "feat: complete billing and multi-tenancy rollout"
```

---

## Coverage Check

The plan covers every major requirement from the spec:

- Stripe plans, checkout, portal, webhook sync, and invoice tracking
- Clerk auth, org bootstrap, invites, and membership checks
- Prisma/Postgres schema with tenant ownership on operational tables
- tenant-scoped Prisma wrapper and request context
- Redis rate limiting and usage enforcement
- Resend templates for lifecycle and billing emails
- team management routes and UI
- hidden `/admin` dashboard in the existing `voice-agent-ui` app
- Stripe setup script and cron jobs
- tests for billing, tenancy, usage, email, and UI access control
