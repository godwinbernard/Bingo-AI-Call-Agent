function buildWelcomeEmail({ companyName, dashboardUrl }) {
  return {
    subject: 'Welcome to VoiceAgent 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1>Welcome to VoiceAgent</h1>
        <p>We’ve created your workspace for ${companyName}.</p>
        <ol>
          <li>Complete onboarding</li>
          <li>Add your calling credentials</li>
          <li>Launch your first campaign</li>
        </ol>
        <p><a href="${dashboardUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Go to Dashboard</a></p>
      </div>
    `,
  };
}

module.exports = { buildWelcomeEmail };
