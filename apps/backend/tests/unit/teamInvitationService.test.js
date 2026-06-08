jest.mock('../../src/billing/subscriptionService', () => ({
  sendInviteEmail: jest.fn().mockResolvedValue({ ok: true }),
}));

const {
  createInvitation,
  acceptInvitation,
  revokeInvitation,
  expirePendingInvitations,
} = require('../../src/team/invitationService');

describe('team invitation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an invitation token and stores expiry', async () => {
    const prisma = {
      invitation: {
        create: jest.fn().mockResolvedValue({ id: 'invite_1', token: 'token_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const invitation = await createInvitation({
      prisma,
      organization: { id: 'org_1', name: 'Acme', billing_email: 'billing@acme.co' },
      inviter: { userId: 'user_1', name: 'Owner' },
      email: 'new.hire@example.com',
      role: 'VIEWER',
      acceptBaseUrl: 'https://app.example.com',
    });

    expect(invitation.id).toBe('invite_1');
    expect(prisma.invitation.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organization_id: 'org_1',
        email: 'new.hire@example.com',
        role: 'VIEWER',
        invited_by: 'user_1',
      }),
    }));
  });

  it('accepts an invitation and creates a member record', async () => {
    const prisma = {
      invitation: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'invite_1',
          organization_id: 'org_1',
          email: 'new.hire@example.com',
          role: 'VIEWER',
          token: 'token_1',
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
          status: 'pending',
        }),
        update: jest.fn().mockResolvedValue({ id: 'invite_1' }),
      },
      organizationMember: {
        upsert: jest.fn().mockResolvedValue({ id: 'member_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await acceptInvitation({
      prisma,
      token: 'token_1',
      user: { userId: 'user_2', email: 'new.hire@example.com', name: 'New Hire' },
    });

    expect(result.accepted).toBe(true);
    expect(prisma.organizationMember.upsert).toHaveBeenCalled();
    expect(prisma.invitation.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'accepted' }),
    }));
  });

  it('revokes pending invitations', async () => {
    const prisma = {
      invitation: {
        update: jest.fn().mockResolvedValue({ id: 'invite_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await revokeInvitation({
      prisma,
      invitationId: 'invite_1',
      organizationId: 'org_1',
      revokedBy: 'user_1',
    });

    expect(result.revoked).toBe(true);
    expect(prisma.invitation.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'expired' }),
    }));
  });

  it('expires old pending invitations', async () => {
    const prisma = {
      invitation: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'invite_1' },
          { id: 'invite_2' },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'invite_1' }),
      },
    };

    const result = await expirePendingInvitations({ prisma, now: new Date() });

    expect(result.expired).toBe(2);
    expect(prisma.invitation.update).toHaveBeenCalledTimes(2);
  });
});
