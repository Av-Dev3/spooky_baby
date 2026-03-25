/**
 * Netlify Function: Send email via Resend
 * POST /.netlify/functions/send-email
 *
 * Body (JSON):
 *   to       — string or array of recipient emails (required)
 *   subject  — string (required)
 *   html     — HTML body (required unless text is set)
 *   text     — plain text body (optional)
 *   replyTo  — string (optional)
 *
 * Env (Netlify → Site → Environment variables):
 *   RESEND_API_KEY   — API key from https://resend.com/api-keys
 *   RESEND_FROM      — Verified sender, e.g. "Spooky Baby <orders@yourdomain.com>"
 *   RESEND_REPLY_TO  — Optional. Where replies go, e.g. spookybabysweets@gmail.com (overridden by body.replyTo if sent)
 *   SEND_EMAIL_SECRET — Optional. If set, require header:
 *                        Authorization: Bearer <SEND_EMAIL_SECRET>
 *                        or X-Send-Email-Secret: <SEND_EMAIL_SECRET>
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Send-Email-Secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secret = process.env.SEND_EMAIL_SECRET;
  if (secret) {
    const auth = event.headers.authorization || event.headers.Authorization || '';
    const bearer = auth.replace(/^Bearer\s+/i, '').trim();
    const headerSecret = event.headers['x-send-email-secret'] || event.headers['X-Send-Email-Secret'];
    if (bearer !== secret && headerSecret !== secret) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Email not configured. Set RESEND_API_KEY and RESEND_FROM in Netlify.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const to = body.to;
  const subject = (body.subject || '').trim();
  const html = body.html;
  const text = body.text;

  if (!to || !subject || (!html && !text)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing to, subject, and html or text' }),
    };
  }

  const toList = Array.isArray(to) ? to : [to];

  const payload = {
    from,
    to: toList,
    subject,
  };
  if (html) payload.html = html;
  if (text) payload.text = text;
  const replyTo = (body.replyTo || '').trim() || (process.env.RESEND_REPLY_TO || '').trim();
  if (replyTo) payload.reply_to = replyTo;

  try {
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
      const msg = data.message || data.name || JSON.stringify(data) || `Resend error (${res.status})`;
      return { statusCode: res.status >= 400 ? res.status : 502, headers, body: JSON.stringify({ error: msg }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: data.id, ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Send failed' }),
    };
  }
};
