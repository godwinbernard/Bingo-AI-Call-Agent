const { PrismaClient } = require('@prisma/client');

let prisma = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    });
  }
  return prisma;
}

function setPrismaClient(client) {
  prisma = client;
}

module.exports = { getPrisma, setPrismaClient };
