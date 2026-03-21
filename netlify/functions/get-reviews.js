/**
 * Netlify Function: Get all reviews (public)
 * GET /.netlify/functions/get-reviews
 *
 * Storage: Netlify Blobs. If Blobs fails, returns empty array (graceful degradation).
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function success(reviews) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ reviews: reviews || [] }),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { connectLambda, getStore } = require('@netlify/blobs');
    connectLambda(event);
    const store = getStore('reviews');
    let reviewsJson = await store.get('reviews');

    if (!reviewsJson) {
      return success([]);
    }

    const data = typeof reviewsJson === 'string' ? JSON.parse(reviewsJson) : reviewsJson;
    const reviews = Array.isArray(data) ? data : (data.reviews || []);

    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return success(reviews);
  } catch (error) {
    console.error('get-reviews error:', error.message || error);

    // Graceful fallback: return empty array so the site still works
    // Check Netlify function logs for the actual error (Blobs may need to be enabled)
    return success([]);
  }
};
