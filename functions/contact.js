export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { name, company, email, phone, gewerk, zeitfresser, ziel } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name und E-Mail sind Pflichtfelder' }), { status: 400, headers });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Anfragen-Werk <onboarding@resend.dev>',
        to: ['javichumartin1975@gmail.com'],
        subject: `Neuer Testzugang: ${company || name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
            <div style="background:#fbe24a;padding:16px 24px;border-radius:6px;margin-bottom:24px;">
              <h1 style="margin:0;font-size:20px;color:#0a0a0a;">Neuer Testzugang beantragt</h1>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Betrieb</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${company || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">E-Mail</td><td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Telefon</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${phone || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Gewerk</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${gewerk || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Zeitfresser</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${zeitfresser || '—'}</td></tr>
              <tr><td style="padding:10px 0;color:#666;">Ziel</td><td style="padding:10px 0;font-weight:600;">${ziel || '—'}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#fff;border-radius:6px;border-left:3px solid #fbe24a;">
              <p style="margin:0;font-size:13px;color:#666;">Eingegangen über <strong>JAYAMO AI · Anfragen-Werk</strong></p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden' }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

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
