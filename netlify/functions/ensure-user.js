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
    const { userId, name, image } = JSON.parse(event.body);

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

    // Upsert user in Stream Chat
    await serverClient.upsertUser({
      id: userId,
      name: name,
      image: image || undefined,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Ensure user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to ensure user' }),
    };
  }
};