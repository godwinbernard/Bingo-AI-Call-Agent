const { getPrisma } = require('../../src/data/prisma');
const { retryPendingStripeWebhookEvents } = require('../../src/billing/billingLifecycleService');

async function main() {
  const prisma = getPrisma();
  await prisma.subscription.findMany({ where: { status: 'past_due' } });
  await retryPendingStripeWebhookEvents({ prisma, now: new Date() });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
