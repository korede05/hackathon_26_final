

const { StreamChat } = require('stream-chat');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { userId, name } = JSON.parse(event.body);

    if (!userId || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or name' }),
      };
    }

    // Initialize Stream Chat server client
    const serverClient = StreamChat.getInstance(
      process.env.VITE_STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    );

    // Create user token
    const token = serverClient.createToken(userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.error('Stream token generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate token' }),
    };
  }
};