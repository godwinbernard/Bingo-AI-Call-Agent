const crypto = require('crypto');
const { getPrisma } = require('../data/prisma');
const { sendInviteEmail } = require('../billing/subscriptionService');

function buildAcceptUrl(baseUrl, token) {
  return `${baseUrl.replace(/\/$/, '')}/onboarding?token=${token}`;
}

function generateInviteToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function createInvitation(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const token = deps.token || generateInviteToken();
  const expiresAt = deps.expiresAt || new Date(Date.now() + 72 * 60 * 60 * 1000);
  const acceptUrl = deps.acceptBaseUrl ? buildAcceptUrl(deps.acceptBaseUrl, token) : null;

  const invitation = await prisma.invitation.create({
    data: {
      organization_id: deps.organization.id,
      email: deps.email,
      role: deps.role,
      token,
      invited_by: deps.inviter.userId,
      expires_at: expiresAt,
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: deps.organization.id,
      user_id: deps.inviter.userId,
      action: 'invite_sent',
      resource_type: 'invitation',
      resource_id: invitation.id,
      metadata: { email: deps.email, role: deps.role },
    },
  });

  if (deps.sendEmail !== false && acceptUrl) {
    await sendInviteEmail({
      inviterName: deps.inviter.name,
      companyName: deps.organization.name,
      role: deps.role,
      acceptUrl,
      to: deps.email,
    });
  }

  return {
    ...invitation,
    invitation,
    token,
    acceptUrl,
  };
}

async function acceptInvitation(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const invitation = await prisma.invitation.findUnique({
    where: { token: deps.token },
  });

  if (!invitation) {
    const error = new Error('Invitation not found');
    error.statusCode = 404;
    throw error;
  }

  if (invitation.status !== 'pending') {
    const error = new Error('Invitation already used');
    error.statusCode = 409;
    throw error;
  }

  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });

    const error = new Error('Invitation expired');
    error.statusCode = 410;
    throw error;
  }

  const member = await prisma.organizationMember.upsert({
    where: {
      organization_id_user_id: {
        organization_id: invitation.organization_id,
        user_id: deps.user.userId,
      },
    },
    update: {
      email: deps.user.email || invitation.email,
      name: deps.user.name || invitation.email,
      role: invitation.role,
      status: 'active',
      joined_at: new Date(),
    },
    create: {
      organization_id: invitation.organization_id,
      user_id: deps.user.userId,
      email: deps.user.email || invitation.email,
      name: deps.user.name || invitation.email,
      role: invitation.role,
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      joined_at: new Date(),
      status: 'active',
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: 'accepted',
      accepted_at: new Date(),
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: invitation.organization_id,
      user_id: deps.user.userId,
      action: 'user_joined',
      resource_type: 'member',
      resource_id: member.id,
      metadata: { email: member.email, role: member.role },
    },
  });

  return { accepted: true, invitation, member };
}

async function revokeInvitation(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const invitation = await prisma.invitation.update({
    where: { id: deps.invitationId },
    data: {
      status: 'expired',
      revoked_at: new Date(),
      revoked_by: deps.revokedBy || null,
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: deps.organizationId,
      user_id: deps.revokedBy || null,
      action: 'invite_revoked',
      resource_type: 'invitation',
      resource_id: invitation.id,
      metadata: { email: invitation.email },
    },
  });

  return { revoked: true, invitation };
}

async function expirePendingInvitations(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const now = deps.now || new Date();
  const invitations = await prisma.invitation.findMany({
    where: {
      status: 'pending',
      expires_at: { lte: now },
    },
  });

  let expired = 0;
  for (const invitation of invitations) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });
    expired += 1;
  }

  return { expired };
}

async function listInvitations(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  return prisma.invitation.findMany({
    where: {
      organization_id: deps.organizationId,
      status: 'pending',
    },
    orderBy: { created_at: 'desc' },
  });
}

module.exports = {
  buildAcceptUrl,
  generateInviteToken,
  createInvitation,
  acceptInvitation,
  revokeInvitation,
  expirePendingInvitations,
  listInvitations,
};
