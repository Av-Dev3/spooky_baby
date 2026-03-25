/**
 * Order confirmation email — HTML + plain text built from structured data.
 * Logo uses your live site URL so the image loads in inboxes (set URL in Netlify or pass siteUrl).
 *
 * @param {object} data
 * @param {string} data.customerName
 * @param {string} [data.customerEmail]
 * @param {string} [data.phone]
 * @param {string} [data.delivery] — e.g. "Pickup" or "Delivery"
 * @param {string} [data.address]
 * @param {string} [data.preferredDate] — pickup/delivery date (display string)
 * @param {string} [data.notes]
 * @param {Array<{ name: string, quantity: number, lineTotal: number }>} data.items
 * @param {number} data.orderTotal
 * @param {number} data.depositPaid
 * @param {number} [data.balanceDue]
 * @param {string} [data.siteUrl] — e.g. https://www.spookybabysweets.com (defaults to process.env.URL on Netlify)
 */

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSiteBaseUrl(data) {
  const fromData = data.siteUrl && String(data.siteUrl).replace(/\/$/, '');
  if (fromData) return fromData;
  if (typeof process !== 'undefined' && process.env) {
    return (process.env.URL || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '');
  }
  return '';
}

function buildOrderConfirmationEmail(data) {
  const name = data.customerName || 'Customer';
  const email = data.customerEmail || '';
  const phone = data.phone || '';
  const delivery = data.delivery || '';
  const address = data.address || '';
  const preferredDate = data.preferredDate || '';
  const notes = data.notes || '';
  const items = Array.isArray(data.items) ? data.items : [];
  const orderTotal = typeof data.orderTotal === 'number' ? data.orderTotal : 0;
  const depositPaid = typeof data.depositPaid === 'number' ? data.depositPaid : 0;
  const balanceDue =
    typeof data.balanceDue === 'number' ? data.balanceDue : Math.max(0, orderTotal - depositPaid);

  const baseUrl = getSiteBaseUrl(data);
  const logoPath = '/assets/logo_spooky.png';
  const logoUrl = baseUrl ? `${baseUrl}${logoPath}` : '';

  const subject = `Thank you for your order, ${name}! — Spooky Baby Sweets`;

  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${Number(i.lineTotal).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const dateLine =
    preferredDate ||
    '(We’ll confirm your pickup or delivery date with you soon if needed.)';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#faf8f6;font-family:Georgia,'Times New Roman',serif;color:#2d2d2d;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0e6ec;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 28px 8px;text-align:center;background:linear-gradient(180deg,#fff5f8 0%,#ffffff 100%);">
              ${logoUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 12px;border-collapse:collapse;">
                <tr>
                  <td bgcolor="#000000" style="background-color:#000000;background:#000000;padding:16px 28px;border-radius:12px;text-align:center;mso-padding-alt:16px 28px;">
                    <img src="${escapeHtml(logoUrl)}" alt="Spooky Baby Sweets" width="140" style="display:block;margin:0 auto;max-width:140px;height:auto;border:0;outline:none;">
                  </td>
                </tr>
              </table>` : ''}
              <p style="margin:0;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:#c2186a;font-family:system-ui,sans-serif;">Order confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.65;color:#2d2d2d;">
              <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#c2186a;">Thank you for ordering from us, ${escapeHtml(name)}!</p>
              <p style="margin:0 0 20px;">We’re so grateful you chose <strong>Spooky Baby Sweets</strong>. Your order is in, and we can’t wait to make your treats.</p>

              <h2 style="margin:24px 0 12px;font-size:17px;font-weight:700;color:#2d2d2d;font-family:system-ui,sans-serif;">Here’s what to expect</h2>
              <ul style="margin:0 0 20px;padding-left:20px;color:#444;">
                <li style="margin-bottom:8px;">We’ll prepare everything fresh for your <strong>${escapeHtml(delivery || 'pickup or delivery')}</strong>.</li>
                <li style="margin-bottom:8px;"><strong>Pickup or delivery date:</strong> ${escapeHtml(dateLine)}</li>
                <li style="margin-bottom:8px;"><strong>Remaining balance due</strong> when you pick up or receive your order: <strong style="color:#c2186a;">$${balanceDue.toFixed(2)}</strong> <span style="color:#666;">(you’ve already paid your 50% deposit of $${depositPaid.toFixed(2)})</span></li>
              </ul>

              <h2 style="margin:24px 0 12px;font-size:17px;font-weight:700;color:#2d2d2d;font-family:system-ui,sans-serif;">Your order</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
                <thead>
                  <tr style="background:#fdf2f7;">
                    <th align="left" style="padding:10px 8px;font-weight:600;">Item</th>
                    <th style="padding:10px 8px;font-weight:600;">Qty</th>
                    <th align="right" style="padding:10px 8px;font-weight:600;">Line</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <p style="margin:12px 0 8px;font-size:14px;">
                <strong>Order total:</strong> $${orderTotal.toFixed(2)}<br>
                <strong>Deposit paid (50%):</strong> $${depositPaid.toFixed(2)}<br>
                <strong>Balance due:</strong> $${balanceDue.toFixed(2)}
              </p>

              ${address ? `<p style="margin:16px 0 0;font-size:14px;"><strong>Delivery address:</strong><br>${escapeHtml(address).replace(/\n/g, '<br>')}</p>` : ''}
              ${notes ? `<p style="margin:16px 0 0;font-size:14px;"><strong>Special instructions:</strong><br>${escapeHtml(notes).replace(/\n/g, '<br>')}</p>` : ''}

              <p style="margin:24px 0 0;font-size:14px;color:#555;">
                ${email ? `<strong>Email on file:</strong> ${escapeHtml(email)}<br>` : ''}
                ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}` : ''}
              </p>

              <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eee;font-size:16px;line-height:1.6;">
                Thank you again, <strong>${escapeHtml(name)}</strong> — we appreciate you and we’ll be in touch if we need anything else. Enjoy the sweetness!<br><br>
                With love,<br>
                <strong style="color:#c2186a;">Spooky Baby Sweets</strong>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#999;font-family:system-ui,sans-serif;">If something looks off, just reply to this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    `Thank you for ordering from us, ${name}!`,
    '',
    `We're grateful you chose Spooky Baby Sweets. Your order is in.`,
    '',
    "HERE'S WHAT TO EXPECT",
    `- Pickup or delivery: ${delivery || 'as selected'}`,
    `- Date: ${dateLine}`,
    `- Remaining balance due at pickup/delivery: $${balanceDue.toFixed(2)} (deposit paid: $${depositPaid.toFixed(2)})`,
    '',
    'YOUR ORDER',
    ...items.map((i) => `  - ${i.name} x${i.quantity}  $${Number(i.lineTotal).toFixed(2)}`),
    '',
    `Order total: $${orderTotal.toFixed(2)}`,
    '',
    email ? `Email: ${email}` : '',
    phone ? `Phone: ${phone}` : '',
    address ? `Delivery address: ${address}` : '',
    notes ? `Special instructions: ${notes}` : '',
    '',
    `Thank you again, ${name} — we appreciate you!`,
    '',
    'With love,',
    'Spooky Baby Sweets',
  ].filter(Boolean);

  const text = textLines.join('\n');

  return { subject, html, text };
}

module.exports = { buildOrderConfirmationEmail, escapeHtml };
