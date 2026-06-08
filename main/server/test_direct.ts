const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || '';

async function test() {
  console.log('Key length:', API_KEY.length);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'http://localhost:4000',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: 'test: say hi in 2 words' }],
      max_tokens: 10,
    }),
  });
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Body:', text);
}

test().catch(e => console.error('Error:', e.message));
