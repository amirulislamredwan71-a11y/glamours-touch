import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 9_000_000) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

const json = (res: VercelResponse, code: number, obj: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(code).send(JSON.stringify(obj));
};

export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return json(res, 500, { error: 'AI not configured' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'bad or too-large body' }); }
  const mimeType = (body.mimeType || 'image/jpeg').toString();
  const imageData = (body.imageBase64 || '').toString().replace(/^data:[^;]+;base64,/, '');
  if (!imageData) return json(res, 400, { error: 'imageBase64 required' });

  const prompt =
    `You are a master Korean-skincare AI analyzing a face photo for Glamour's Touch (glamourstouch.com). ` +
    `Assess visibly present skin condition and respond with ONLY minified JSON, no markdown, exactly: ` +
    `{"skinType":"<Bangla: শুষ্ক | তৈলাক্ত | মিশ্র | স্বাভাবিক>", ` +
    `"glowScore":<int 40-85, visible skin health score>, ` +
    `"concerns":[{"name":"<Bangla concern e.g. মেছতা ও দাগ / ব্রণ / অসমান টোন / পোরস / শুষ্কতা>","level":"<কম | মাঝারি | বেশি>"}] (2-4 items), ` +
    `"ingredients":["<Bangla active>"] (e.g. সেন্টেলা, নিয়াসিনামাইড, স্নেল মিউসিন, ভিটামিন সি, পেপটাইড), ` +
    `"routine":["<Bangla routine step>"] (3 steps), ` +
    `"combo":["<Exact Authentic Korean Product Name with Price BDT>"] (exactly 3 items e.g. "COSRX Salicylic Cleanser (৳৯৮০)", "AXIS-Y Dark Spot Serum (৳১,৬০০)", "Beauty of Joseon Sunscreen (৳১,৬০০)")}. ` +
    `All text fields in Bangla. Be honest and encouraging.`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${KEY}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageData } }] }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.6, responseMimeType: 'application/json' },
        }),
      },
    );
    const d: any = await r.json();
    let txt = (d?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join('').trim();
    txt = txt.replace(/^```json\s*|^```\s*|\s*```$/g, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(txt); } catch { parsed = null; }
    if (!parsed || !parsed.concerns) return json(res, 502, { error: 'scan unavailable', detail: (d?.error?.message || d?.promptFeedback?.blockReason || '').toString().slice(0, 140) });
    const out = {
      skinType: String(parsed.skinType || '').slice(0, 30),
      glowScore: Math.max(35, Math.min(90, Number(parsed.glowScore) || 70)),
      concerns: (Array.isArray(parsed.concerns) ? parsed.concerns : []).slice(0, 4).map((c: any) => ({ name: String(c.name || '').slice(0, 40), level: String(c.level || '').slice(0, 12) })).filter((c: any) => c.name),
      ingredients: (Array.isArray(parsed.ingredients) ? parsed.ingredients : []).slice(0, 3).map((x: any) => String(x).slice(0, 40)).filter(Boolean),
      routine: (Array.isArray(parsed.routine) ? parsed.routine : []).slice(0, 3).map((x: any) => String(x).slice(0, 80)).filter(Boolean),
      combo: (Array.isArray(parsed.combo) ? parsed.combo : []).slice(0, 3).map((x: any) => String(x).slice(0, 80)).filter(Boolean),
    };
    return json(res, 200, out);
  } catch (e: any) {
    return json(res, 500, { error: 'scan failed', detail: String(e?.message || e).slice(0, 140) });
  }
}
