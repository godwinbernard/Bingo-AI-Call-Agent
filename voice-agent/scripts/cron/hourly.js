const { getPrisma } = require('../../src/data/prisma');

async function main() {
  const prisma = getPrisma();
  await prisma.subscription.findMany({ where: { status: 'past_due' } });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
