function buildInviteTeamEmail({ inviterName, companyName, role, acceptUrl }) {
  return {
    subject: `${inviterName} invited you to VoiceAgent`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1>${inviterName} invited you to VoiceAgent</h1>
        <p>You’ve been invited to join ${companyName} as ${role}.</p>
        <p>This invite expires in 72 hours.</p>
        <p><a href="${acceptUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Accept Invitation</a></p>
      </div>
    `,
  };
}

module.exports = { buildInviteTeamEmail };
