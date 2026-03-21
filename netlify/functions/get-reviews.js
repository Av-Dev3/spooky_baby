const { getStore } = require('@netlify/blobs');

/**
 * Netlify Function: Get all reviews (public)
 * GET /.netlify/functions/get-reviews
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const store = getStore({ name: 'reviews', consistency: 'strong' });
    let reviewsJson = await store.get('reviews');

    if (!reviewsJson) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reviews: [] }),
      };
    }

    const data = typeof reviewsJson === 'string' ? JSON.parse(reviewsJson) : reviewsJson;
    const reviews = Array.isArray(data) ? data : (data.reviews || []);

    // Sort by date, newest first
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reviews }),
    };
  } catch (error) {
    console.error('get-reviews error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load reviews' }),
    };
  }
};
