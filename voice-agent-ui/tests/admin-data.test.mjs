import test from 'node:test';
import assert from 'node:assert/strict';
import adminData from '../lib/adminData.js';

const {
  buildAdminOverview,
  buildAdminCustomers,
  buildAdminRevenueSummary,
} = adminData;

test('buildAdminOverview returns expected aggregate shape', () => {
  const overview = buildAdminOverview([
    {
      plan: 'GROWTH',
      status: 'active',
      calls_used_this_month: 847,
    },
  ]);

  assert.equal(overview.totalOrganizations, 1);
  assert.equal(overview.mrr, 29900);
  assert.equal(overview.activeTrials, 0);
  assert.equal(overview.churnedThisMonth, 0);
  assert.equal(overview.totalCallsToday, 28);
});

test('buildAdminCustomers formats customer rows', () => {
  const customers = buildAdminCustomers([
    {
      name: 'Acme Inc',
      plan: 'GROWTH',
      mrr_label: '$299',
      calls_label: '847 / 2,000',
      status: 'active',
      joined_label: 'Jan 3, 2026',
    },
  ]);

  assert.deepEqual(customers, [
    {
      name: 'Acme Inc',
      plan: 'GROWTH',
      mrr: '$299',
      calls: '847 / 2,000',
      status: 'active',
      joined: 'Jan 3, 2026',
    },
  ]);
});

test('buildAdminRevenueSummary returns display-friendly revenue data', () => {
  const summary = buildAdminRevenueSummary([
    { plan: 'ENTERPRISE', status: 'active' },
    { plan: 'GROWTH', status: 'trialing' },
  ]);

  assert.equal(summary.mrr, '$1,298');
  assert.equal(summary.activeOrganizations, 1);
  assert.equal(summary.trialOrganizations, 1);
  assert.equal(summary.churnedOrganizations, 0);
  assert.equal(summary.ltvEstimate, '$15,576');
});
