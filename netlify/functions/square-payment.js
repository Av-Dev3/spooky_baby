/**
 * Netlify Function: Process Square payment
 * POST /.netlify/functions/square-payment
 * Body: { sourceId, amount, currency?, locationId? }
 *
 * Requires env: SQUARE_ACCESS_TOKEN (from Square Developer Dashboard)
 * Sandbox: https://developer.squareup.com/apps > Your App > Sandbox > Access Token
 */

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
    const { sourceId, amount, currency = 'USD', locationId } = body;

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

    const useSandbox = process.env.SQUARE_SANDBOX !== 'false';
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ payment: data.payment }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Payment processing error' }),
    };
  }
};
