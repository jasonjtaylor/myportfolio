const OpenAI = require('openai');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { system, messages } = JSON.parse(event.body || '{}');
    
    if (!Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid payload: messages must be an array' })
      };
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' })
      };
    }

    // Initialize OpenAI (v4 SDK)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare messages array with system prompt
    const chatMessages = [];
    if (system) {
      chatMessages.push({ role: 'system', content: system });
    }
    chatMessages.push(...messages);

    // Create chat completion with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
      stream: true,
      temperature: 0.4,
    });

    // For Netlify Functions, we need to collect the stream and return it
    // Since Netlify doesn't support true streaming responses easily,
    // we'll return the full response as text/plain
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
      body: fullResponse
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};