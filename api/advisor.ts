import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 200_000) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const json = (res: VercelResponse, code: number, obj: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(code).send(JSON.stringify(obj));
};

const SYSTEM = `You are the "Glow Advisor" — Glamour's Touch (গ্ল্যামারস টাচ)-এর বন্ধুত্বপূর্ণ AI Korean-skincare বিশেষজ্ঞ। Glamour's Touch হলো বাংলাদেশের ১০০% অথেন্টিক Korean cosmetics shop (glamourstouch.com)।

ভাষা: গ্রাহক যে ভাষায় লেখে সেই ভাষায় উত্তর দাও — বাংলা হলে বাংলায় (সহজ, আন্তরিক), English হলে English-এ। সংক্ষিপ্ত রাখো (২–৫ বাক্য), emoji অল্প।

তোমার কাজ:
- ত্বকের সমস্যা (ব্রণ/দাগ, কালো দাগ, শুষ্কতা, তৈলাক্ততা, গ্লো, বয়সের ছাপ, সানবার্ন) শুনে সঠিক Korean রুটিন ও উপাদান suggest করো — যেমন dark spot → niacinamide/TXA/vitamin-C serum; hydration → hyaluronic/PDRN/snail; acne → centella/salicylic; anti-age → retinal/collagen; সবসময় দিনে SPF।
- Glamour's Touch-এ পাওয়া যায় এমন ব্র্যান্ড থেকে উদাহরণ দাও: Medicube, Anua, Beauty of Joseon, Dabo, SKIN1004, AXIS-Y, Mixsoon, COSRX ইত্যাদি। নির্দিষ্ট নাম না জানলে category/উপাদান বলো, নির্দিষ্ট দাম বানিয়ে বলো না।
- সবসময় নরমভাবে nudge করো: (১) "AI Glow Predictor"-এ নিজের মুখে ২৮ দিনের ফল দেখুন (/glow-predictor), (২) অর্ডার/মানুষের সাহায্যের জন্য WhatsApp (01712-426871) বা সাইটে।
- সৎ থাকো: কোনো চিকিৎসা-নিশ্চয়তা দিও না; নতুন পণ্যে patch-test বলো; গুরুতর সমস্যায় dermatologist দেখাতে বলো। দাম/স্টক নিশ্চিত না জানলে সাইট দেখতে বলো। কখনো মিথ্যা বা "chapa" দিও না।`;

// Live AI "Glow Advisor" — Korean-skincare chat powered by Gemini flash (free tier).
export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return json(res, 500, { error: 'GEMINI_API_KEY not configured on the server' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'Invalid or too-large body' }); }

  const msgs = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const contents = msgs
    .map((m: any) => ({
      role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 1500) }],
    }))
    .filter((c: any) => c.parts[0].text);
  if (!contents.length) return json(res, 400, { error: 'no messages' });

  const gBody = {
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
  };

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gBody) },
    );
    const d: any = await r.json();
    const reply = (d?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join(' ').trim();
    if (!reply) return json(res, 502, { error: 'no reply', detail: (d?.error?.message || d?.promptFeedback?.blockReason || 'unknown').toString().slice(0, 160) });
    return json(res, 200, { reply });
  } catch (e: any) {
    return json(res, 500, { error: 'chat failed', detail: String(e?.message || e).slice(0, 160) });
  }
}
