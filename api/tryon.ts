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

// Cosmetics AR "try-on": show a realistic after-N-days skin result of a product on the user's own photo.
export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return json(res, 500, { error: 'GEMINI_API_KEY not configured on the server' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'Invalid or too-large body' }); }

  const productName: string = (body.productName || 'this Korean skincare product').toString().slice(0, 120);
  const effect: string = (body.effect || '').toString().slice(0, 300);
  const days: number = Number(body.days) || 28;
  const mimeType: string = (body.mimeType || 'image/jpeg').toString();
  const imageData: string = (body.imageBase64 || '').toString().replace(/^data:[^;]+;base64,/, '');
  if (!imageData) return json(res, 400, { error: 'imageBase64 required' });

  const prompt =
    `You are a professional dermatology-grade skincare visualization AI. The attached photo is a real person's face/skin. ` +
    `Using your knowledge of the specific product "${productName}"` + (effect ? ` — official use-case / benefit as stated by the brand: "${effect}"` : '') + `, plus its known active ingredients and the exact concern it is formulated to treat, ` +
    `show a realistic, believable preview of this same person's skin after using ONLY this product correctly and consistently for about ${days} days. ` +
    `Base the visible change STRICTLY on this product's stated use-case above — show the BEST realistic outcome a full ${days}-day course of THIS product genuinely delivers (no more, no less). ` +
    `Apply ONLY the improvement this specific product actually targets — e.g. a niacinamide/TXA/vitamin-C brightening serum → more even tone and faded dark spots; a snail/hyaluronic/collagen/PDRN cream → plumper, smoother, more hydrated skin; a sunscreen → healthy protected even-toned skin; an acne/pore product → fewer blemishes and refined pores; retinal → firmer smoother texture. ` +
    `STRICT: keep the SAME person, same identity, same face shape, same age, same angle and lighting. Keep natural skin texture (pores, moles). Do NOT add makeup, do NOT airbrush to plastic/filtered perfection, do NOT change features — only the realistic improvement this product gives. Output ONE photorealistic image.`;

  const gBody = {
    contents: [{ parts: [
      { text: prompt },
      { inline_data: { mime_type: mimeType, data: imageData } },
    ] }],
  };

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gBody) },
    );
    const d: any = await r.json();
    const parts = d?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p: any) => p.inline_data?.data || p.inlineData?.data);
    const out = imgPart?.inline_data?.data || imgPart?.inlineData?.data;
    if (!out) {
      return json(res, 502, { error: 'No image generated', detail: (d?.error?.message || d?.promptFeedback?.blockReason || 'unknown').toString().slice(0, 200) });
    }
    return json(res, 200, { image: `data:image/png;base64,${out}` });
  } catch (e: any) {
    return json(res, 500, { error: 'Generation failed', detail: String(e?.message || e).slice(0, 160) });
  }
}
