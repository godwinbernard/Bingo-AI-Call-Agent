const { buildWelcomeEmail } = require('../../src/email/templates/welcomeEmail');
const { buildTrialEndingEmail } = require('../../src/email/templates/trialEndingEmail');

describe('email templates', () => {
  it('builds the welcome email', () => {
    const email = buildWelcomeEmail({ companyName: 'Acme', dashboardUrl: 'https://app.local/dashboard' });
    expect(email.subject).toBe('Welcome to VoiceAgent 🎉');
    expect(email.html).toContain('Go to Dashboard');
  });

  it('builds the trial ending email', () => {
    const email = buildTrialEndingEmail({
      companyName: 'Acme',
      daysLeft: 3,
      billingUrl: 'https://app.local/billing',
      usageSummary: '400 / 500',
    });
    expect(email.subject).toContain('3 days');
    expect(email.html).toContain('Add Payment Method');
  });
});
