/**
 * Netlify Function: Process Square payment
 * POST /.netlify/functions/square-payment
 * Body: {
 *   sourceId, amount, currency?, locationId?,
 *   orderEmail?: { customerName, customerEmail, phone?, delivery, address?, preferredDate?, notes?, cart[], orderTotal, depositPaid, balanceDue }
 * }
 * After a successful charge, sends order confirmation via Resend if RESEND_* env is set.
 *
 * Requires env: SQUARE_ACCESS_TOKEN (from Square Developer Dashboard)
 */

const { buildOrderConfirmationEmail } = require('./email-templates/order-confirmation');
const { sendHtmlEmail } = require('./lib/resend-send');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const SQUARE_SANDBOX = 'https://connect.squareupsandbox.com';
const SQUARE_PROD = 'https://connect.squareup.com';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Square not configured. Set SQUARE_ACCESS_TOKEN in Netlify env.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { sourceId, amount, currency = 'USD', locationId, orderEmail } = body;

    if (!sourceId || !amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing sourceId or amount' }),
      };
    }

    const locId = locationId || process.env.SQUARE_LOCATION_ID;
    if (!locId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing locationId. Set SQUARE_LOCATION_ID or pass in body.' }),
      };
    }

    // Production: set SQUARE_SANDBOX=false and use Production access token in Netlify
    const useSandbox = process.env.SQUARE_SANDBOX === 'true';
    const base = useSandbox ? SQUARE_SANDBOX : SQUARE_PROD;

    const res = await fetch(`${base}/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: `spooky-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        amount_money: {
          amount: Math.round(amount),
          currency,
        },
        location_id: locId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.errors?.[0]?.detail || data.errors?.[0]?.code || data.message || 'Payment failed';
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: errMsg }),
      };
    }

    let emailResult = null;
    if (orderEmail && orderEmail.customerEmail) {
      try {
        emailResult = await sendOrderConfirmationAfterPayment(orderEmail);
      } catch (emailErr) {
        console.error('Order confirmation email failed:', emailErr);
        emailResult = { ok: false, error: emailErr.message };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment: data.payment,
        emailSent: emailResult && emailResult.ok === true,
        emailError: emailResult && !emailResult.ok ? emailResult.error || emailResult.skipped : undefined,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Payment processing error' }),
    };
  }
};

function formatPreferredDateForEmail(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function sendOrderConfirmationAfterPayment(orderEmail) {
  const cart = Array.isArray(orderEmail.cart) ? orderEmail.cart : [];
  const items = cart.map((i) => ({
    name: i.name || 'Item',
    quantity: i.quantity || 1,
    lineTotal: (Number(i.price) || 0) * (Number(i.quantity) || 1),
  }));

  const deliveryRaw = orderEmail.delivery || '';
  const deliveryLabel =
    deliveryRaw === 'pickup' ? 'Pickup' : deliveryRaw === 'delivery' ? 'Delivery' : deliveryRaw;

  const preferredRaw = orderEmail.preferredDate || '';
  const preferredDisplay = preferredRaw ? formatPreferredDateForEmail(preferredRaw) : '';

  const siteUrl = (process.env.URL || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '');

  const { subject, html, text } = buildOrderConfirmationEmail({
    customerName: orderEmail.customerName || 'Customer',
    customerEmail: orderEmail.customerEmail,
    phone: orderEmail.phone || '',
    delivery: deliveryLabel,
    address: orderEmail.address || '',
    preferredDate: preferredDisplay,
    notes: orderEmail.notes || '',
    items,
    orderTotal: Number(orderEmail.orderTotal) || 0,
    depositPaid: Number(orderEmail.depositPaid) || 0,
    balanceDue: Number(orderEmail.balanceDue) || 0,
    siteUrl: siteUrl || undefined,
  });

  return sendHtmlEmail({
    to: orderEmail.customerEmail,
    subject,
    html,
    text,
  });
}
