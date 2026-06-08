function buildTrialEndingEmail({ companyName, daysLeft, billingUrl, usageSummary }) {
  return {
    subject: `Your trial ends in ${daysLeft} days`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1>Your trial ends in ${daysLeft} days</h1>
        <p>${companyName} is currently on the trial plan.</p>
        <p>Usage this month: ${usageSummary || 'Not available'}</p>
        <p><a href="${billingUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Add Payment Method</a></p>
      </div>
    `,
  };
}

module.exports = { buildTrialEndingEmail };
