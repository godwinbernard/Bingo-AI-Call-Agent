# VoiceAgent Billing and Multi-Tenancy Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete Stripe billing, Clerk auth, Prisma/Postgres multi-tenancy, Redis rate limiting, Resend email flows, and tenant-aware UI pages so the Voice AI Agent SaaS is subscription ready.

**Architecture:** The backend service in `voice-agent` remains the source of truth for org state, subscriptions, usage, API keys, webhooks, and tenant-scoped data access. The Next.js app in `voice-agent-ui` renders auth, billing, team, and admin screens, and only calls backend endpoints that already enforce membership, subscription, and tenant isolation.

**Tech Stack:** Stripe, Clerk, Prisma ORM, PostgreSQL, Redis, Resend, Next.js middleware, Next.js App Router, existing Express backend, existing Twilio/Deepgram/ElevenLabs/Claude integrations.

---

## 1. Scope and Boundaries

This change is intentionally broad but still one product system:

- `voice-agent` owns:
  - Clerk auth verification and org membership lookups
  - Stripe customer/subscription/portal/webhook logic
  - Prisma schema and tenant-scoped DB access
  - usage metering, plan limits, and PAYG reporting
  - Redis rate limiting
  - Resend email dispatch and templates
  - API routes for billing, team, usage, and admin data
- `voice-agent-ui` owns:
  - sign-in, sign-up, onboarding
  - billing overview and upgrade flow
  - team management
  - hidden `/admin` dashboards under the same app
  - middleware that blocks unauthenticated or cross-tenant navigation

### Explicit non-goals

- No second admin app.
- No org identifiers in URL params.
- No direct client access to Prisma, Stripe secret operations, or org-scoped records without backend guards.
- No partial billing implementation; the Stripe webhook and usage system must be complete before the UI is treated as production ready.

---

## 2. Subscription Model

The Stripe plans are fixed and must match these tiers exactly:

- `STARTER` — `$99/month`
  - `calls_per_month: 500`
  - `max_campaigns: 2`
  - `max_scripts: 3`
  - `max_team_members: 1`
  - `custom_voice: false`
  - `api_access: false`
  - `crm_integrations: false`
  - `support_level: email`
- `GROWTH` — `$299/month`
  - `calls_per_month: 2000`
  - `max_campaigns: unlimited`
  - `max_scripts: unlimited`
  - `max_team_members: 5`
  - `custom_voice: true`
  - `api_access: true`
  - `crm_integrations: true`
  - `support_level: priority`
- `ENTERPRISE` — `$999/month`
  - `calls_per_month: unlimited`
  - `max_campaigns: unlimited`
  - `max_scripts: unlimited`
  - `max_team_members: unlimited`
  - `custom_voice: true`
  - `api_access: true`
  - `crm_integrations: true`
  - `white_label: true`
  - `sso: true`
  - `audit_logs: true`
  - `sla: 99.9%`
  - `support_level: dedicated`
- `PAY_AS_YOU_GO` — `$0/month`
  - `calls_per_month: 0`
  - `price_per_minute: $0.08`
  - `max_campaigns: 1`
  - `max_scripts: 1`
  - `max_team_members: 1`

The backend must treat plan limits as the source of truth, not the UI.

---

## 3. Prisma and PostgreSQL Model

The schema lives in the backend and models tenant ownership at the organization level.

### Core models

- `Organization`
- `OrganizationMember`
- `Invitation`
- `Subscription`
- `Invoice`
- `UsageRecord`
- `ApiKey`
- `AuditLog`

### Existing operational models that gain `organization_id`

- `Campaign`
- `Script`
- `Contact`
- `Call`
- `DncList`

### Required relationships

- `Organization` has many members, campaigns, scripts, contacts, calls, invoices, api keys, audit logs, usage records, and invitations.
- `OrganizationMember` links a Clerk `user_id` to a tenant membership and role.
- `Subscription` is one-to-one with `Organization`.
- `ApiKey` and `AuditLog` are always tenant scoped.

### Required fields

- `Organization`
  - `id`
  - `name`
  - `slug`
  - `logo_url`
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `subscription_tier`
  - `subscription_status`
  - `trial_ends_at`
  - `billing_email`
  - `billing_name`
  - `calls_used_this_month`
  - `usage_reset_date`
  - `timezone`
  - `call_hours_start`
  - `call_hours_end`
  - `max_concurrent`
  - `created_at`
  - `updated_at`
- `OrganizationMember`
  - `id`
  - `organization_id`
  - `user_id`
  - `email`
  - `name`
  - `role`
  - `invited_by`
  - `invited_at`
  - `joined_at`
  - `status`
  - `created_at`
- `Invitation`
  - `id`
  - `organization_id`
  - `email`
  - `role`
  - `token`
  - `invited_by`
  - `expires_at`
  - `accepted_at`
  - `status`
  - `created_at`
- `Subscription`
  - `id`
  - `organization_id`
  - `stripe_subscription_id`
  - `stripe_price_id`
  - `tier`
  - `status`
  - `current_period_start`
  - `current_period_end`
  - `cancel_at_period_end`
  - `canceled_at`
  - `trial_start`
  - `trial_end`
  - `created_at`
  - `updated_at`
- `Invoice`
  - `id`
  - `organization_id`
  - `stripe_invoice_id`
  - `amount_paid`
  - `amount_due`
  - `currency`
  - `status`
  - `invoice_url`
  - `invoice_pdf`
  - `period_start`
  - `period_end`
  - `paid_at`
  - `created_at`
- `UsageRecord`
  - `id`
  - `organization_id`
  - `month`
  - `calls_made`
  - `minutes_used`
  - `amount_cents`
  - `recorded_at`
- `ApiKey`
  - `id`
  - `organization_id`
  - `name`
  - `key_hash`
  - `key_prefix`
  - `last_used_at`
  - `expires_at`
  - `is_active`
  - `created_by`
  - `created_at`
- `AuditLog`
  - `id`
  - `organization_id`
  - `user_id`
  - `action`
  - `resource_type`
  - `resource_id`
  - `metadata`
  - `ip_address`
  - `user_agent`
  - `created_at`

### Required enum values

- `subscription_tier`: `STARTER | GROWTH | ENTERPRISE | PAY_AS_YOU_GO`
- `subscription_status`: `active | past_due | canceled | trialing`
- `member_role`: `OWNER | ADMIN | MANAGER | VIEWER`
- `member_status`: `active | invited | suspended`
- `invitation_status`: `pending | accepted | expired`
- `invoice_status`: `paid | open | void | uncollectible`

### Data integrity rules

- `Organization.slug` must be unique.
- `Organization.stripe_customer_id` must be unique.
- `Subscription.organization_id` and `Subscription.stripe_subscription_id` must be unique.
- `Invoice.stripe_invoice_id` must be unique.
- `ApiKey.key_hash` stores only a hash, never the plaintext key.
- `ApiKey.key_prefix` stores only the display prefix.

---

## 4. Backend Module Layout

The backend should be split into focused files so billing, tenancy, and email logic stay testable.

### `voice-agent/src/billing/`

- `stripeClient.js`
  - initializes Stripe
  - exports price IDs from env
- `subscriptionService.js`
  - customer creation
  - checkout session creation
  - billing portal creation
  - subscription lifecycle handlers
- `stripeWebhooks.js`
  - signature verification
  - event routing
  - idempotent event handling
- `usageService.js`
  - plan limit checks
  - monthly usage resets
  - PAYG metering
  - usage summaries
- `invoiceService.js`
  - invoice persistence
  - invoice fetch/download link normalization

### `voice-agent/src/auth/`

- `clerkClient.js`
  - Clerk client setup and auth helpers
- `middleware.js`
  - auth guard for backend routes
- `permissions.js`
  - role-based access control

### `voice-agent/src/tenancy/`

- `tenantContext.js`
  - request-scoped org and member lookup
- `tenantMiddleware.js`
  - membership and subscription validation
- `tenantIsolation.js`
  - Prisma wrapper that auto-applies `organization_id`

### `voice-agent/src/email/`

- `resendClient.js`
  - Resend client setup
- `templates/`
  - `welcomeEmail.js`
  - `trialEndingEmail.js`
  - `paymentFailedEmail.js`
  - `inviteTeamEmail.js`
  - `invoiceEmail.js`

### `voice-agent/src/api/`

- `billing/checkout.js`
- `billing/portal.js`
- `billing/webhook.js`
- `billing/usage.js`
- `team/invite.js`
- `team/members.js`
- `team/roles.js`

These routes are thin wrappers around the service layer.

---

## 5. Auth and Tenant Flow

### Signup flow

1. User signs up with Clerk.
2. Backend creates an `Organization` record from the company name.
3. Backend generates a slug from the company name and ensures uniqueness.
4. Backend creates the Stripe customer.
5. Backend starts the 14-day GROWTH trial.
6. Backend sends the welcome email with Resend.
7. UI redirects to onboarding.

### Login flow

1. Clerk authenticates the user.
2. Backend resolves `OrganizationMember` from `user_id`.
3. Backend loads the `Organization`.
4. Backend blocks suspended users and disallowed subscription states.
5. Backend injects tenant context into the request.

### Invitation flow

1. Admin creates an invite with email and role.
2. Backend stores a token with a 72-hour expiry.
3. Backend sends invite email.
4. Recipient signs in or signs up with Clerk.
5. Backend accepts the invite, creates membership, and logs `user_joined`.

### Tenant isolation rule

Every DB query that touches tenant-owned data must be executed through the tenant wrapper, not raw Prisma.

Example intent:

- raw query: `prisma.campaign.findMany()`
- required pattern: `tenant(req).campaign.findMany()`

The wrapper must throw if no org context exists.

---

## 6. Stripe Billing Design

### Stripe client

- Initialize Stripe with `STRIPE_SECRET_KEY`.
- Export plan price IDs from env.
- Keep monthly and annual price IDs available for plan switching.

### Checkout session

- Creates a subscription checkout session for a chosen tier.
- Includes a 14-day trial for new signups where appropriate.
- Stores `org_id` and `tier` in metadata.
- Returns the checkout URL to the UI.

### Billing portal

- Creates a customer portal session for payment method management, plan change, cancellation, and invoice downloads.

### Subscription lifecycle handlers

- `handleSubscriptionCreated`
  - updates org tier/status
  - sets usage reset date
  - sends welcome or upgrade email
  - writes audit log
- `handleSubscriptionUpdated`
  - detects tier changes
  - unlocks or removes features immediately or at period end depending on Stripe state
  - sends confirmation email
- `handleSubscriptionCanceled`
  - marks subscription canceled
  - stores cancel dates
  - sends cancellation email
- `handlePaymentFailed`
  - sends payment failure email
  - marks account as at risk
  - pauses campaigns after repeated failures

### Webhooks

The webhook endpoint is `POST /api/billing/webhook` and must bypass auth middleware but still verify Stripe signatures.

Required Stripe events:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.created`
- `payment_method.attached`
- `customer.updated`

The webhook handler should acknowledge quickly and push all nontrivial work into the service layer.

---

## 7. Usage Enforcement and Redis Rate Limiting

### Usage service

- `checkCallLimit(org_id)`
  - loads current month usage
  - compares usage against tier limit
  - throws a 429 when the limit is exhausted
- `incrementCallUsage(org_id, minutes)`
  - increments call usage
  - stores minutes for PAYG billing
  - records Stripe metered usage when needed
- `resetMonthlyUsage()`
  - runs monthly
  - resets the counter
  - persists a monthly usage record
- `getUsageSummary(org_id)`
  - returns used, limit, percentage, days until reset, and cost estimate
- `reportPaygUsage(org_id, minutes)`
  - reports metered usage only for PAYG plans

### Redis rate limiting

- Auth endpoints: 10 requests per minute
- API key endpoints: 100 requests per minute per key
- Webhook endpoint: no rate limit

The key scope for rate limiting must be organization-aware, not global.

### Usage UX rules

- At 80% usage, show a warning and send email.
- At 95% usage, send another warning email.
- At 100%, block new campaign starts, show the upgrade banner, return 429, and send the limit-reached email.

---

## 8. Permission Model

### OWNER

- Full access
- Can manage billing
- Can manage all members
- Can delete organization

### ADMIN

- Full app access except billing ownership actions
- Can invite/remove members
- Can manage campaigns and scripts

### MANAGER

- Can create/edit/start campaigns
- Can create/edit scripts
- Can view calls and reports
- Cannot manage team or billing

### VIEWER

- Read-only access
- Can view dashboard, calls, and reports
- Cannot create or modify resources

The permission middleware must be enforced server-side for every sensitive action.

---

## 9. Email System

Resend handles transactional emails, and the templates should be clean HTML with the company branding and indigo CTAs.

Required templates:

- welcome email
- trial ending email
- payment failed email
- invite team email
- invoice email
- upgrade confirmation email
- cancellation email
- monthly usage email

The sending layer should accept typed inputs and keep templates free of business logic.

---

## 10. API Key Management

API keys are available only for GROWTH and ENTERPRISE.

### Key format and storage

- Key format: `va_live_XXXXXXXXXXXXXXXX`
- Store only a bcrypt hash
- Show the full key only once
- Display only the prefix afterward

### Middleware behavior

- Accept API key from the `Authorization` header
- Hash and look up the key
- Load organization context
- Update `last_used_at`
- Rate limit per key

### UI behavior

- List active keys with name, prefix, and last used time
- Allow create and revoke
- Warn that the secret cannot be shown again

---

## 11. Frontend Pages in `voice-agent-ui`

### Auth pages

- `/sign-in`
- `/sign-up`
- `/onboarding`

### Billing pages

- `/billing`
- `/billing/upgrade`
- `/billing/success`

### Team page

- `/team`

### Admin pages

- `/admin`
- `/admin/customers`
- `/admin/revenue`

### UI requirements

- Billing page shows current plan, renewal date, usage bar, trial banner, payment failure banner, and invoice table.
- Upgrade page shows all four tiers, annual toggle, feature comparison, current plan highlighting, and CTAs.
- Team page shows members, invite modal, pending invitations, role editing, and seat counts.
- Admin pages show platform overview, customers, revenue, and support actions.

The admin pages must remain inside the existing app and be protected by `ADMIN_SECRET`.

---

## 12. Middleware and Route Protection

### Next.js middleware in `voice-agent-ui`

- Redirect unauthenticated users to sign-in.
- Prevent navigation when the user has no active org membership.
- Redirect canceled accounts to billing.
- Show payment banners when past due.

### Backend auth middleware

- Reject unauthenticated API requests.
- Enforce org context before all tenant writes.
- Exempt the Stripe webhook route only from auth, not from signature verification.

### CORS

- Whitelist only the product domain(s).
- Deny unknown origins by default.

---

## 13. Admin Super-Dashboard

The admin dashboard is intentionally hidden and lives under `/admin` in `voice-agent-ui`.

### Protected access

- The request must include the correct `ADMIN_SECRET`.
- No public access path should exist.

### Metrics

- total organizations
- MRR
- active trials
- churned this month
- calls made today
- revenue chart for the last 90 days

### Customer management

- org name
- plan
- MRR
- calls used
- status
- joined date
- impersonate
- extend trial
- change plan

The admin screens are read/write only where explicitly allowed.

---

## 14. Scheduled Jobs

### Daily

- Send trial-ending emails at 7, 3, and 1 days out
- Check past_due subscriptions
- Clean expired invitations

### Monthly

- Reset call usage counters
- Send monthly usage emails
- Generate usage records

### Hourly

- Sync subscription status from Stripe
- Retry failed webhook processing

If scheduling is not already present, the implementation should add a minimal cron-compatible runner rather than embedding job logic in the HTTP routes.

---

## 15. Testing Strategy

The implementation should add tests before or alongside the code where practical.

### Billing tests

- checkout session created correctly
- webhook signature verified
- subscription created updates org
- payment failed triggers email
- usage limit blocks calls at 100%
- usage warning sent at 80%
- PAYG usage reported to Stripe

### Tenancy tests

- Org A cannot access Org B data
- every query includes `organization_id`
- suspended member cannot login
- viewer cannot start campaign
- manager cannot access billing
- owner can do everything

### UI tests

- billing page shows the correct plan and usage
- upgrade page reflects the active plan
- team page shows members and invites
- admin page is blocked without `ADMIN_SECRET`

### Required verification

- backend unit tests
- integration tests against in-memory or test doubles
- UI route smoke checks
- Prisma schema validation

---

## 16. Environment Variables

These variables must be added to `.env.example` and wired into the implementation:

- Stripe
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_STARTER_PRICE_ID`
  - `STRIPE_GROWTH_PRICE_ID`
  - `STRIPE_ENTERPRISE_PRICE_ID`
  - `STRIPE_PAYG_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Clerk
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- Resend
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `EMAIL_FROM_NAME`
- Admin
  - `ADMIN_SECRET`

The implementation should fail fast with a clear error when required variables are missing.

---

## 17. Stripe Setup Script

The repo should include `scripts/setupStripe.js` to:

- create the four products
- create monthly prices for each
- create annual prices with a 20% discount
- create the PAYG metered price
- configure the customer portal
- print all price IDs for `.env`
- create the webhook endpoint

This script should be idempotent enough to re-run safely during setup.

---

## 18. Implementation Order

The safest implementation sequence is:

1. Prisma schema and tenant fields
2. tenant-aware Prisma wrapper and permissions
3. Clerk auth/session/org bootstrap
4. Stripe client, subscription service, webhook handler
5. Usage service and Redis rate limiting
6. Resend templates and notification flows
7. Billing/team/admin API routes
8. `voice-agent-ui` auth, billing, team, and admin pages
9. cron/job wiring
10. tests and cleanup

This order keeps billing and tenancy correct before UI polish.

---

## 19. Acceptance Criteria

The change is complete only when:

- a new user can sign up, create an org, enter a 14-day trial, and land in onboarding
- Stripe checkout and portal work end to end
- webhook events update org/subscription/invoice state correctly
- every tenant-owned query is scoped to one organization
- usage limits block calls at the right thresholds
- API keys work only for eligible plans
- team invites and role changes work
- `/admin` is available inside `voice-agent-ui` and protected by `ADMIN_SECRET`
- the test suite covers billing, tenancy, and key UI pages
