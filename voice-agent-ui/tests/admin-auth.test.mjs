import test from 'node:test';
import assert from 'node:assert/strict';
import adminAuth from '../lib/adminAuth.js';

const { isAdminRequestAuthorized, createAdminCookie, clearAdminCookie } = adminAuth;

test('rejects missing admin secret', () => {
  assert.equal(isAdminRequestAuthorized({ headers: new Headers() }, 'top-secret'), false);
});

test('accepts matching admin secret from cookie header', () => {
  const headers = new Headers({ cookie: createAdminCookie('top-secret') });
  assert.equal(isAdminRequestAuthorized({ headers }, 'top-secret'), true);
});

test('creates and clears admin cookie strings', () => {
  assert.match(createAdminCookie('top-secret'), /voiceagent_admin_secret=/);
  assert.match(clearAdminCookie(), /Max-Age=0/);
});
