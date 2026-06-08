function buildPaymentFailedEmail({ companyName, billingUrl, amountDue }) {
  return {
    subject: 'Action required: Payment failed',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h1>Action required: Payment failed</h1>
        <p>We could not process the latest invoice for ${companyName}.</p>
        <p>Amount due: ${amountDue}</p>
        <p><a href="${billingUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Update Payment Method</a></p>
      </div>
    `,
  };
}

module.exports = { buildPaymentFailedEmail };
