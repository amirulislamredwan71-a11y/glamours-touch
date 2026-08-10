import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 100_000) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const json = (res: VercelResponse, code: number, obj: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(code).send(JSON.stringify(obj));
};

// AI skin-improvement analysis for the Glow Predictor result (Gemini flash-lite → structured JSON).
export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return json(res, 500, { error: 'AI not configured' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'bad body' }); }

  const name = String(body.productName || 'this Korean skincare product').slice(0, 140);
  const effect = String(body.effect || '').slice(0, 260);
  const days = Number(body.days) || 30;

  const prompt =
    `You are a Korean-skincare analysis AI for Glamour's Touch. For the product "${name}"` +
    (effect ? ` (brand details: ${effect})` : '') +
    `, give a REALISTIC, non-exaggerated ${days}-day skin-improvement prediction for typical skin. ` +
    `Respond with ONLY valid minified JSON (no markdown, no code fences), exactly this shape: ` +
    `{"glowScore": <int 55-92, how well-suited/useful this product is overall>, ` +
    `"days": <int 26-30 recommended>, ` +
    `"metrics": [ {"label":"<short Bangla metric name>","value":"<+NN% or -NN%>"} ] (3 or 4 items, each tied to THIS product's REAL benefit — e.g. niacinamide→tone/spots, hyaluronic/PDRN→hydration, retinal→texture), ` +
    `"summary":"<ONE natural Bangla sentence: key active ingredient → what it does → use ~N days>", ` +
    `"combo":["<Bangla product-type suggestion 1>","<Bangla product-type suggestion 2>"] (2 items that pair with this for a complete routine)}. ` +
    `Percentages must be realistic (30-90). All text fields in Bangla. Output JSON only.`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${KEY}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7, responseMimeType: 'application/json' },
        }),
      },
    );
    const d: any = await r.json();
    let txt = (d?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join('').trim();
    txt = txt.replace(/^```json\s*|^```\s*|\s*```$/g, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(txt); } catch { parsed = null; }
    if (!parsed || !parsed.metrics) return json(res, 502, { error: 'analysis unavailable', detail: (d?.error?.message || '').slice(0, 120) });
    // clamp / sanitize
    const glowScore = Math.max(50, Math.min(95, Number(parsed.glowScore) || 78));
    const out = {
      glowScore,
      days: Math.max(26, Math.min(35, Number(parsed.days) || days)),
      metrics: (Array.isArray(parsed.metrics) ? parsed.metrics : []).slice(0, 4)
        .map((m: any) => ({ label: String(m.label || '').slice(0, 40), value: String(m.value || '').slice(0, 8) }))
        .filter((m: any) => m.label && m.value),
      summary: String(parsed.summary || '').slice(0, 260),
      combo: (Array.isArray(parsed.combo) ? parsed.combo : []).slice(0, 3).map((c: any) => String(c).slice(0, 60)).filter(Boolean),
    };
    return json(res, 200, out);
  } catch (e: any) {
    return json(res, 500, { error: 'analysis failed', detail: String(e?.message || e).slice(0, 120) });
  }
}
