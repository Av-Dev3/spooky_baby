const { google } = require('googleapis');

/**
 * Netlify Function to fetch photos from Google Drive
 * 
 * Environment Variables Required:
 * - GOOGLE_CLIENT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Full PEM key with BEGIN/END and real newlines
 * - GOOGLE_DRIVE_FOLDER_ID: ID of the Google Drive folder containing images
 * 
 * Query Parameters:
 * - limit: Number of photos to return (default: 24, max: 100)
 * - pageToken: Token for pagination (optional)
 * 
 * Returns:
 * - JSON with items array and nextPageToken
 * - Each item has: id, src, thumb, caption, ts
 */

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Validate environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      console.error('Missing required environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server configuration error: Missing Google Drive credentials'
        })
      };
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 24, 100);
    const pageToken = queryParams.pageToken || null;

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Build query for images in the specified folder
    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    
    // Fetch files from Google Drive
    const response = await drive.files.list({
      q: query,
      pageSize: limit,
      pageToken: pageToken,
      fields: 'nextPageToken, files(id, name, description, thumbnailLink, webViewLink, modifiedTime, mimeType)',
      orderBy: 'modifiedTime desc'
    });

    const files = response.data.files || [];
    const nextPageToken = response.data.nextPageToken || null;

    // Transform files to gallery format
    const items = files.map(file => {
      // Create direct image URL
      const src = `https://drive.google.com/uc?id=${file.id}`;
      
      // Use thumbnail if available, otherwise use full image
      const thumb = file.thumbnailLink || src;
      
      // Use description as caption, fallback to filename
      const caption = file.description || file.name;
      
      // Format timestamp
      const ts = file.modifiedTime;

      return {
        id: file.id,
        src: src,
        thumb: thumb,
        caption: caption,
        ts: ts
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        items: items,
        nextPageToken: nextPageToken
      })
    };

  } catch (error) {
    console.error('Error fetching photos from Google Drive:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch photos from Google Drive'
      })
    };
  }
};
