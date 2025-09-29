/**
 * Test function to check environment variables
 * This helps debug configuration issues
 */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Check which environment variables are present
    const envCheck = {
      GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    // Get partial values for debugging (without exposing secrets)
    const partialValues = {
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 
        process.env.GOOGLE_CLIENT_EMAIL.substring(0, 10) + '...' : 'NOT SET',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 
        'Set (' + process.env.GOOGLE_PRIVATE_KEY.length + ' chars)' : 'NOT SET',
      GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || 'NOT SET'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Environment variables check',
        present: envCheck,
        partialValues: partialValues,
        allEnvVars: Object.keys(process.env).filter(key => key.startsWith('GOOGLE'))
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Test function error',
        message: error.message
      })
    };
  }
};
