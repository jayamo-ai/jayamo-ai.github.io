export async function onRequestPost(context) {
  const { request, env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { messages, system } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: system || 'Du bist ein hilfreicher Assistent.',
        messages: messages
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'API-Fehler' }), { status: 502, headers });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Entschuldigung, kurzer Fehler.';

    return new Response(JSON.stringify({ reply }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
