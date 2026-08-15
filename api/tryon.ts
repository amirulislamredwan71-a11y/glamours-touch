import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 9_000_000) reject(new Error('too_large'));
    });
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

  const KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'Invalid or too-large body' }); }

  const productName: string = (body.productName || 'this Korean skincare product').toString().slice(0, 120);
  const effect: string = (body.effect || '').toString().slice(0, 300);
  const days: number = Number(body.days) || 28;
  const mimeType: string = (body.mimeType || 'image/jpeg').toString();
  const imageData: string = (body.imageBase64 || '').toString().replace(/^data:[^;]+;base64,/, '');
  if (!imageData) return json(res, 400, { error: 'imageBase64 required' });

  // If GEMINI_API_KEY is available, attempt multi-model vision tryon
  if (KEY) {
    const prompt =
      `You are a professional dermatology-grade skincare visualization AI. The attached photo is a real person's face. ` +
      `Using your knowledge of "${productName}" (${effect}), generate a photorealistic ~${days}-day skin transformation prediction. ` +
      `STRICT: Keep 100% SAME person identity, face shape, eyes, hair, glasses, lighting and pose. ` +
      `Apply targeted skincare improvement based on active ingredients (e.g. Niacinamide/TXA → clear dark spots & even glass tone; Centella → remove redness & acne; Snail/PDRN → plump hydration & glow). ` +
      `Do NOT blur face. Keep natural skin texture, sharp details, and photorealistic accuracy. Output 1 image.`;

    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageData } }] }],
          }),
        },
      );
      const d: any = await r.json();
      const parts = d?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p: any) => p.inline_data?.data || p.inlineData?.data);
      const out = imgPart?.inline_data?.data || imgPart?.inlineData?.data;
      if (out) {
        return json(res, 200, { image: `data:image/png;base64,${out}` });
      }
    } catch (e: any) {}
  }

  // Fallback: return photo with high-precision client transformation signal
  return json(res, 200, { image: `data:${mimeType};base64,${imageData}`, isClientTransformNeeded: true });
}
