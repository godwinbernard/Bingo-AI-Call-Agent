# VoiceAgent Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stubbed hidden `/admin` screens with a server-protected, backend-backed admin console that shows live platform metrics and customer rows.

**Architecture:** Keep `/admin` inside `voice-agent-ui`, but move access control to the server with `ADMIN_SECRET`. Load admin metrics from server-side helpers that query the backend data model instead of hard-coded arrays, and preserve the existing visual shell so the dashboard changes stay focused and easy to verify.

**Tech Stack:** Next.js App Router, `voice-agent-ui`, server-side route protection, existing backend data model, Prisma/PostgreSQL aggregates, Node test runner for route checks, existing design system components.

---

### Task 1: Add server-side admin guard

**Files:**
- Create: `voice-agent-ui/lib/adminAuth.js`
- Modify: `voice-agent-ui/middleware.js:1-44`
- Modify: `voice-agent-ui/app/admin/page.js:1-64`
- Modify: `voice-agent-ui/app/admin/customers/page.js:1-61`
- Modify: `voice-agent-ui/app/admin/revenue/page.js:1-37`
- Create: `tests/admin-auth.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminRequestAuthorized } from '../voice-agent-ui/lib/adminAuth.js';

test('rejects missing admin secret', () => {
  assert.equal(isAdminRequestAuthorized({ headers: new Headers() }), false);
});

test('accepts matching admin secret', () => {
  const headers = new Headers({ 'x-admin-secret': 'top-secret' });
  assert.equal(isAdminRequestAuthorized({ headers }, 'top-secret'), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/admin-auth.test.mjs`
Expected: FAIL because `voice-agent-ui/lib/adminAuth.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function isAdminRequestAuthorized(request, adminSecret = process.env.ADMIN_SECRET) {
  if (!adminSecret) return false;
  const providedSecret = request.headers.get('x-admin-secret');
  return Boolean(providedSecret) && providedSecret === adminSecret;
}

export function assertAdminRequest(request, adminSecret = process.env.ADMIN_SECRET) {
  if (!isAdminRequestAuthorized(request, adminSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/admin-auth.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent-ui/lib/adminAuth.js voice-agent-ui/middleware.js voice-agent-ui/app/admin/page.js voice-agent-ui/app/admin/customers/page.js voice-agent-ui/app/admin/revenue/page.js tests/admin-auth.test.mjs
git commit -m "feat: add server-side admin guard"
```

---

### Task 2: Add backend-backed admin metrics service

**Files:**
- Create: `voice-agent-ui/lib/adminData.js`
- Create: `voice-agent-ui/app/api/admin/overview/route.js`
- Create: `voice-agent-ui/app/api/admin/customers/route.js`
- Create: `voice-agent-ui/app/api/admin/revenue/route.js`
- Modify: `voice-agent-ui/app/admin/page.js:1-64`
- Modify: `voice-agent-ui/app/admin/customers/page.js:1-61`
- Modify: `voice-agent-ui/app/admin/revenue/page.js:1-37`
- Create: `tests/admin-data.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminOverview } from '../voice-agent-ui/lib/adminData.js';

test('buildAdminOverview returns expected shape', () => {
  const overview = buildAdminOverview([
    { id: 'org_1', subscription_tier: 'GROWTH', subscription_status: 'active', calls_used_this_month: 847 },
  ]);

  assert.equal(overview.totalOrganizations, 1);
  assert.equal(overview.mrr, 299);
  assert.equal(overview.activeTrials, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/admin-data.test.mjs`
Expected: FAIL because the helper has not been created.

- [ ] **Step 3: Write minimal implementation**

```js
const PLAN_MRR = {
  STARTER: 99,
  GROWTH: 299,
  ENTERPRISE: 999,
  PAY_AS_YOU_GO: 0,
};

export function buildAdminOverview(organizations = []) {
  const totalOrganizations = organizations.length;
  const mrr = organizations.reduce((sum, organization) => {
    return sum + (PLAN_MRR[organization.subscription_tier] || 0);
  }, 0);

  return {
    totalOrganizations,
    mrr,
    activeTrials: organizations.filter((organization) => organization.subscription_status === 'trialing').length,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/admin-data.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent-ui/lib/adminData.js voice-agent-ui/app/api/admin/overview/route.js voice-agent-ui/app/api/admin/customers/route.js voice-agent-ui/app/api/admin/revenue/route.js voice-agent-ui/app/admin/page.js voice-agent-ui/app/admin/customers/page.js voice-agent-ui/app/admin/revenue/page.js tests/admin-data.test.mjs
git commit -m "feat: wire admin metrics data"
```

---

### Task 3: Replace placeholder admin screens with real data loading

**Files:**
- Create: `voice-agent-ui/lib/adminRender.js`
- Modify: `voice-agent-ui/app/admin/page.js:1-64`
- Modify: `voice-agent-ui/app/admin/customers/page.js:1-61`
- Modify: `voice-agent-ui/app/admin/revenue/page.js:1-37`
- Modify: `voice-agent-ui/components/layout/TopBar.jsx:1-101`
- Create: `tests/admin-render.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdminCustomersTable } from '../voice-agent-ui/lib/adminRender.js';

test('customer table renders org names from data', () => {
  const html = renderAdminCustomersTable([
    { name: 'Acme Inc', plan: 'GROWTH', mrr: '$299', calls: '847', status: 'active', joined: 'Jan 3, 2026' },
  ]);

  assert.ok(html.includes('Acme Inc'));
  assert.ok(html.includes('GROWTH'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/admin-render.test.mjs`
Expected: FAIL because the renderer helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function renderAdminCustomersTable(customers) {
  return customers.map((customer) => `${customer.name}:${customer.plan}:${customer.status}`).join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/admin-render.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add voice-agent-ui/lib/adminRender.js voice-agent-ui/app/admin/page.js voice-agent-ui/app/admin/customers/page.js voice-agent-ui/app/admin/revenue/page.js voice-agent-ui/components/layout/TopBar.jsx tests/admin-render.test.mjs
git commit -m "feat: render admin dashboard from live data"
```

---

### Task 4: Verify protected admin flow in the browser

**Files:**
- Use existing: `voice-agent-ui/app/admin/page.js`
- Use existing: `voice-agent-ui/app/admin/customers/page.js`
- Use existing: `voice-agent-ui/app/admin/revenue/page.js`
- Create: `tests/admin-route.test.mjs`

- [ ] **Step 1: Write the failing browser check**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('unauthorized admin route returns 401', async () => {
  const response = await fetch('http://127.0.0.1:3001/admin');
  assert.equal(response.status, 401);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/admin-route.test.mjs`
Expected: FAIL until the server-side guard is active and the dev server is running.

- [ ] **Step 3: Verify the real route once the guard is in place**

Run: `npm run build`
Run: `npm run dev`
Run: `curl -I http://127.0.0.1:3001/admin`
Expected:
- `401` without `x-admin-secret`
- `200` with `x-admin-secret: <ADMIN_SECRET>`

- [ ] **Step 4: Commit**

```bash
git add tests/admin-route.test.mjs
git commit -m "test: verify admin route protection"
```

---

### Task 5: Final verification and cleanup

**Files:**
- Modify: any admin files touched above
- Modify: `voice-agent-ui/.env.example` if the admin secret needs clearer local documentation

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: PASS with the admin routes included in the route list.

- [ ] **Step 2: Check the route output**

Run: `npm run build`
Expected output should include:
- `/admin`
- `/admin/customers`
- `/admin/revenue`

- [ ] **Step 3: Clean up any temporary test artifacts**

If you created helper scripts or throwaway test files during development, remove them before finishing so the workspace stays focused on the shipped code.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: ship protected admin dashboard"
```
