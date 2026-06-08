const { getPrisma } = require('../data/prisma');

async function findMemberByUserId(userId, prisma = getPrisma()) {
  return prisma.organizationMember.findFirst({
    where: { user_id: userId },
    include: { organization: true },
  });
}

async function loadTenantContext(userId, prisma = getPrisma()) {
  const member = await findMemberByUserId(userId, prisma);
  if (!member) {
    return null;
  }

  const organization = member.organization;
  return {
    organization,
    member,
  };
}

module.exports = { findMemberByUserId, loadTenantContext };
