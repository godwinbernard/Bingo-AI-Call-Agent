const { getPrisma } = require('../../src/data/prisma');
const { sendTransactionalEmail } = require('../../src/email/resendClient');
const { buildTrialEndingEmail } = require('../../src/email/templates/trialEndingEmail');

async function main() {
  const prisma = getPrisma();
  const organizations = await prisma.organization.findMany();

  for (const organization of organizations) {
    if (!organization.trial_ends_at) continue;
    const daysLeft = Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if ([7, 3, 1].includes(daysLeft)) {
      const template = buildTrialEndingEmail({
        companyName: organization.name,
        daysLeft,
        billingUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/billing`,
        usageSummary: `${organization.calls_used_this_month} calls used`,
      });
      await sendTransactionalEmail({
        to: organization.billing_email,
        ...template,
      });
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
