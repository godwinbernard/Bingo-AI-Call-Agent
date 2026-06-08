function buildInvoiceEmail({ companyName, invoiceUrl, amountPaid, periodLabel }) {
  return {
    subject: `Your VoiceAgent invoice for ${periodLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1>Your VoiceAgent invoice for ${periodLabel}</h1>
        <p>${companyName} paid ${amountPaid}.</p>
        <p><a href="${invoiceUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">View Invoice</a></p>
      </div>
    `,
  };
}

module.exports = { buildInvoiceEmail };
