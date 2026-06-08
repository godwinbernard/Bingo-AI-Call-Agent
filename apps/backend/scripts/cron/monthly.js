const { resetMonthlyUsage } = require('../../src/billing/usageService');

async function main() {
  await resetMonthlyUsage();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
