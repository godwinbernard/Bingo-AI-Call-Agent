const { checkPermission } = require('../../src/auth/permissions');

describe('permissions', () => {
  it('lets owners manage billing', () => {
    expect(checkPermission({ role: 'OWNER' }, 'billing.manage')).toBe(true);
  });

  it('blocks viewers from starting campaigns', () => {
    expect(() => checkPermission({ role: 'VIEWER' }, 'campaign.start')).toThrow('Forbidden');
  });
});
