const { getStore } = require('@netlify/blobs');

/**
 * Netlify Function: Submit a new review (public)
 * POST /.netlify/functions/submit-review
 * Body: { name, rating, text, image_urls? }
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const MAX_IMAGE_SIZE = 300 * 1024; // 300KB per image
const MAX_IMAGES = 3;

async function processBody(event) {
  if (event.body) {
    try {
      return JSON.parse(event.body);
    } catch {
      return null;
    }
  }
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = await processBody(event);
    if (!body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const name = (body.name || '').trim();
    const rating = parseInt(body.rating, 10);
    const text = (body.text || '').trim();
    let imageUrls = Array.isArray(body.image_urls) ? body.image_urls : [];

    if (!name || !text) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and text are required' }) };
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Rating must be 1-5' }) };
    }
    if (imageUrls.length > MAX_IMAGES) {
      imageUrls = imageUrls.slice(0, MAX_IMAGES);
    }

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      name,
      rating,
      text,
      created_at: new Date().toISOString(),
      response: null,
      response_at: null,
    };
    if (imageUrls.length > 0) {
      newReview.image_url = JSON.stringify(imageUrls);
    }

    const store = getStore({ name: 'reviews', consistency: 'strong' });
    let reviewsJson = await store.get('reviews');

    let reviews = [];
    if (reviewsJson) {
      const data = typeof reviewsJson === 'string' ? JSON.parse(reviewsJson) : reviewsJson;
      reviews = Array.isArray(data) ? data : (data.reviews || []);
    }

    reviews.unshift(newReview);
    await store.set('reviews', JSON.stringify(reviews));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: newReview.id }),
    };
  } catch (error) {
    console.error('submit-review error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit review' }),
    };
  }
};
