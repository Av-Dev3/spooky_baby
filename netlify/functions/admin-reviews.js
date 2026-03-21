const { getStore } = require('@netlify/blobs');

/**
 * Netlify Function: Admin reviews - password protected
 * GET with ?password=xxx - get all reviews
 * POST with body { password, action: "respond", reviewId, response } - add response to review
 *
 * Set ADMIN_PASSWORD in Netlify env vars
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function checkPassword(event, body) {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) {
    console.error('ADMIN_PASSWORD not set in environment');
    return false;
  }

  let password;
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    password = params.password;
  } else if (body) {
    password = body.password;
  }

  return password === envPassword;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body = null;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = {};
    }
  }

  if (!checkPassword(event, body)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const store = getStore({ name: 'reviews', consistency: 'strong' });
    let reviewsJson = await store.get('reviews');

    let reviews = [];
    if (reviewsJson) {
      const data = typeof reviewsJson === 'string' ? JSON.parse(reviewsJson) : reviewsJson;
      reviews = Array.isArray(data) ? data : (data.reviews || []);
    }

    if (event.httpMethod === 'GET') {
      reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reviews }),
      };
    }

    if (event.httpMethod === 'POST' && body?.action === 'respond') {
      const { reviewId, response } = body;
      const responseText = (response || '').trim();

      if (!reviewId || !responseText) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'reviewId and response are required' }),
        };
      }

      const index = reviews.findIndex((r) => r.id === reviewId);
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Review not found' }),
        };
      }

      reviews[index].response = responseText;
      reviews[index].response_at = new Date().toISOString();

      await store.set('reviews', JSON.stringify(reviews));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' }),
    };
  } catch (error) {
    console.error('admin-reviews error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
