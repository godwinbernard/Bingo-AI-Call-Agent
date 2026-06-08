const { Resend } = require('resend');

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendTransactionalEmail({ to, subject, html, from, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true };
  }

  return getResendClient().emails.send({
    from: from || `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    reply_to: replyTo,
  });
}

module.exports = { getResendClient, sendTransactionalEmail };
