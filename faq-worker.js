export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: cors })
    }

    try {
      const body = await request.json()
      const { url, gewerk, betrieb } = body

      if (!url) {
        return new Response(JSON.stringify({ error: 'URL fehlt' }), { status: 400, headers: cors })
      }

      // Website abrufen
      let siteContent = ''
      try {
        const siteResp = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JAYAMO-AI-Bot/1.0)' },
          cf: { timeout: 10000 }
        })
        const html = await siteResp.text()
        // HTML bereinigen — nur Text behalten
        siteContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 8000) // Max 8000 Zeichen
      } catch(e) {
        siteContent = 'Website konnte nicht geladen werden.'
      }

      // Anthropic API — FAQs generieren
      const prompt = `Du analysierst die Website eines ${gewerk || 'Handwerks'}-Betriebs namens "${betrieb || 'Unbekannt'}".

Website-Inhalt:
${siteContent}

Erstelle basierend auf diesem Inhalt genau 40 realistische FAQ-Paare die Kunden dieses Betriebs stellen würden.
Fokus auf: Preise, Termine, Notdienst, Einzugsgebiet, Leistungen, Ablauf, Garantie, Qualifikationen.

Antworte NUR mit einem JSON-Array in diesem Format, ohne Erklärungen:
[
  {"q": "Frage 1", "a": "Antwort 1"},
  {"q": "Frage 2", "a": "Antwort 2"}
]`

      const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const aiData = await aiResp.json()
      const rawText = aiData.content?.[0]?.text || '[]'

      // JSON parsen
      let faqs = []
      try {
        const jsonMatch = rawText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          faqs = JSON.parse(jsonMatch[0])
        }
      } catch(e) {
        faqs = []
      }

      // Max 40 FAQs
      faqs = faqs.slice(0, 40)

      return new Response(JSON.stringify({ faqs, count: faqs.length }), {
        status: 200, headers: cors
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: cors
      })
    }
  }
}
