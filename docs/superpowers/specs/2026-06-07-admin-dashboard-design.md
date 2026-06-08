# VoiceAgent Admin Dashboard Design

> **For agentic workers:** This spec covers the hidden multi-tenant admin area only. Use the existing backend and `voice-agent-ui` app; do not create a separate admin app.

**Goal:** Replace the current stubbed `/admin` screens with a real server-protected admin console that shows live organization metrics, customer rows, and revenue summaries sourced from the backend data model.

**Architecture:** `/admin` stays inside `voice-agent-ui`, but access is enforced on the server with `ADMIN_SECRET`. The admin UI reads from backend admin endpoints or direct server-side queries only after authorization succeeds. The client no longer “unlocks” the dashboard with `sessionStorage`.

**Tech Stack:** Next.js App Router, existing `voice-agent-ui`, existing backend services, Prisma/PostgreSQL data model, server-side route protection, existing design system components.

---

## 1. Scope and Boundaries

This feature is the missing admin layer for the existing subscription-ready SaaS:

- `voice-agent-ui` owns:
  - `/admin`
  - `/admin/customers`
  - `/admin/revenue`
  - the server-side guard that requires `ADMIN_SECRET`
- `voice-agent` backend owns:
  - organization, subscription, usage, invoice, and call data
  - admin data aggregation queries
  - any future impersonation or trial-extension actions

### Explicit non-goals

- No second admin application.
- No client-side admin unlock flow.
- No admin route that exposes tenant data without server-side authorization.
- No hard-coded customer rows or stat cards once backend data is available.
- No attempt to solve team management or billing flow in this task; those remain separate follow-ups.

---

## 2. Admin Access Model

The admin dashboard must be protected by a real server-side check:

- Requests to `/admin` routes require the correct `x-admin-secret` header.
- The secret value is compared against `process.env.ADMIN_SECRET`.
- Unauthorized requests return `401 Unauthorized`.
- When `ADMIN_SECRET` is missing in local development, the route should fail closed rather than exposing data.

### Access flow

- A request hits `/admin/*`.
- Middleware or a server helper checks the `x-admin-secret` header.
- If valid, the request proceeds and the admin page can query data.
- If invalid or absent, the request is denied before rendering sensitive content.

### Expected behavior in the UI

- The old `sessionStorage` unlock flow is removed.
- The admin pages may still render a lightweight prompt or error state, but that state must not expose data until the server check passes.

---

## 3. Admin Data Model

The admin screens consume aggregated multi-tenant data from the existing billing and usage model.

### Platform overview metrics

- total organizations
- monthly recurring revenue
- active trials
- churned organizations this month
- total calls today across the platform

### Customer table fields

- organization name
- subscription tier
- monthly recurring revenue
- calls used this month
- subscription status
- created/joined date
- optional actions column for future admin operations

### Revenue panel fields

- MRR
- churn
- LTV
- trial conversion trends
- recent plan changes

The source of truth for these numbers is backend data, not hard-coded arrays in the UI.

---

## 4. Route Structure

The admin area remains nested under the existing app:

- `/admin`
  - platform overview cards
- `/admin/customers`
  - organization table and status summary
- `/admin/revenue`
  - revenue summary panel and chart placeholders

The top bar should continue to show `Admin` as the page title when the admin routes are open.

---

## 5. Implementation Shape

### Server protection

- Add a reusable server-side admin guard helper.
- Wire the guard into middleware or route handlers before page rendering.
- Keep the guard simple and explicit: header in, secret compare, allow or deny.

### Data loading

- Replace hard-coded arrays in the admin pages with real server-driven data.
- Use server components or server-side helper functions so the dashboard can render with consistent data on first load.
- Preserve the current visual structure where possible to reduce UI churn.

### UI behavior

- Keep the current admin layout style, but swap placeholder values for live metrics.
- Add loading and error states for data fetch failures.
- Keep the admin interface visually consistent with the rest of the app.

---

## 6. Error Handling

- Missing or wrong `x-admin-secret`:
  - return `401 Unauthorized`
  - do not render the admin payload
- Missing backend data:
  - show empty-state cards and table rows
  - do not crash the page
- Data fetch failure:
  - show a compact error message and keep the page shell intact

The admin area should fail safely and predictably, since it is intentionally hidden and sensitive.

---

## 7. Testing Plan

The implementation should include tests for:

- unauthorized `/admin` request returns `401`
- authorized `/admin` request renders successfully
- `/admin/customers` renders tenant metrics from the data layer
- `/admin/revenue` handles empty or missing aggregate data
- the old client-side unlock flow is no longer required

Browser verification should confirm:

- the hidden admin route loads only with the correct secret
- the customer table and overview cards show stable values
- the admin page does not expose tenant data without authorization

---

## 8. Delivery Notes

This task is intentionally limited to the admin console foundation:

- server-protected hidden routes
- live overview metrics
- customer table
- revenue summary shell

The next logical follow-ups are:

- impersonation actions
- trial extension actions
- customer plan change actions
- deeper revenue charts

Those should remain separate implementation steps so the admin console can be shipped safely and verified incrementally.
