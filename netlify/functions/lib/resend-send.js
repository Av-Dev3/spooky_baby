/**
 * Shared Resend send (used by square-payment and optionally send-email logic).
 * Returns { ok, id?, error? }
 */

async function sendHtmlEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = (process.env.RESEND_REPLY_TO || '').trim();

  if (!apiKey || !from) {
    return { ok: false, skipped: true, error: 'RESEND_API_KEY or RESEND_FROM not set' };
  }
  if (!to || !subject || (!html && !text)) {
    return { ok: false, error: 'Missing to, subject, or body' };
  }

  const toList = Array.isArray(to) ? to : [to];
  const payload = {
    from,
    to: toList,
    subject,
  };
  if (html) payload.html = html;
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.name || JSON.stringify(data) || `Resend ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, id: data.id };
}

module.exports = { sendHtmlEmail };
