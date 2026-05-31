export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { messages, system } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
        status: 400, headers: corsHeaders
      });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key fehlt' }), {
        status: 500, headers: corsHeaders
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
      const errText = await response.text();
      return new Response(JSON.stringify({ error: 'Anthropic Fehler: ' + errText }), {
        status: 502, headers: corsHeaders
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Keine Antwort.';

    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Fehler: ' + err.message }), {
      status: 500, headers: corsHeaders
    });
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
