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

function getSmartFallbackReply(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('ব্রণ') || q.includes('acne') || q.includes('pimple') || q.includes('বিচি')) {
    return 'ব্রণ ও পিম্পল দূর করার জন্য অরিজিনাল কোরিয়ান SKIN1004 Madagascar Centella Ampoule এবং COSRX Salicylic Acid Cleanser অত্যন্ত কার্যকরী! এগুলো ত্বকের ব্যাকটেরিয়া ধুয়ে ফেলে জ্বালা-পোড়া কমায়। বিস্তারিত দেখতে আমাদের শপ ব্রাউজ করুন অথবা হোয়াটসঅ্যাপ করুন: 01712-426871 ✨';
  }
  if (q.includes('দাগ') || q.includes('মেছতা') || q.includes('spot') || q.includes('dark') || q.includes('pigmentation')) {
    return 'মেছতা ও ক্ষতের কালো দাগ হালকা করতে কোরিয়ান টপ সেলিং AXIS-Y Dark Spot Correcting Glow Serum এবং Anua Niacinamide Serum সেরা! এটি ত্বকে দৃশ্যমান উজ্জ্বলতা ও সমান টোন নিয়ে আসে। অর্ডারের জন্য ওয়েবসাইটের শপ মেনু দেখুন বা কল করুন: 01712-426871 🌸';
  }
  if (q.includes('সানস্ক্রিন') || q.includes('sun') || q.includes('sunscreen') || q.includes('রোদে')) {
    return 'রোদ ও ক্ষতিকর UV রশি থেকে ত্বক বাঁচাতে Beauty of Joseon Relief Sun (SPF50+) এবং SKIN1004 Hyalu-Cica Sun Serum ব্যবহার করতে পারেন। এগুলো হালকা, কোন হোয়াইট কাস্ট ফেলে না এবং ত্বকে গ্লাস গ্লো দেয় ☀️';
  }
  if (q.includes('শুষ্ক') || q.includes('dry') || q.includes('খসখসে') || q.includes('ময়েশ্চারাইজার')) {
    return 'শুষ্ক ও ডিহাইড্রেটেড ত্বকের জন্য COSRX Advanced Snail 96 Mucin Essence এবং Beauty of Joseon Dynasty Cream ম্যাজিকের মতো কাজ করে। এগুলো ত্বকের ডিপ ময়েশ্চার লক করে কোমল রাখে 💧';
  }
  if (q.includes('গ্লো') || q.includes('glow') || q.includes('উজ্জ্বল') || q.includes('glass skin')) {
    return 'ইনস্ট্যান্ট গ্লাস গ্লো ও রেডিয়েন্স পেতে Anua Heartleaf 77% Soothing Toner এবং Medicube PDRN Pink Peptide Serum ব্যবহার করুন। ১০০% আসল কোরিয়ান ফরম্যুলা আপনার ত্বককে করে তুলবে প্রাণবন্ত! ✨';
  }

  return "ধন্যবাদ! গ্ল্যামারস টাচে পাচ্ছেন ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার ও কসমেটিকস। আপনার নির্দিষ্ট ত্বকের সমস্যা (ব্রণ, দাগ, শুষ্কতা) লিখে জানান, অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে (01712-426871) যুক্ত হন 🌿";
}

const SYSTEM = `You are "Glow Advisor", the friendly AI skincare expert of Glamour's Touch (গ্ল্যামারস টাচ) — Bangladesh's 100% authentic Korean cosmetics shop (glamourstouch.com).
Reply in Bengali. Keep it warm, simple and SHORT — 2 to 4 sentences. Recommend Korean ingredients (Centella, Niacinamide, Vitamin C) and K-Beauty brands (SKIN1004, Axis-Y, Beauty of Joseon, COSRX, Medicube) from Glamour's Touch.`;

async function viaGroq(KEY: string, history: any[]): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM },
    ...history.map((m) => ({ role: (m.role === 'model' || m.role === 'assistant') ? 'assistant' : 'user', content: m.content })),
  ];
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 700, temperature: 0.6 }),
  });
  const d: any = await r.json();
  return (d?.choices?.[0]?.message?.content || '').trim();
}

async function viaGemini(KEY: string, history: any[]): Promise<string> {
  const contents = history.map((m) => ({
    role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const gBody = {
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { maxOutputTokens: 700, temperature: 0.6 },
  };
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gBody) },
  );
  const d: any = await r.json();
  return (d?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join(' ').trim();
}

export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'Invalid or too-large body' }); }

  const msgs = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const history = msgs
    .map((m: any) => ({ role: m.role, content: String(m.content || '').slice(0, 1500) }))
    .filter((m: any) => m.content);

  if (!history.length) return json(res, 400, { error: 'no messages' });

  const lastUserQuery = history.filter((h: any) => h.role === 'user').pop()?.content || '';

  const GROQ = process.env.GROQ_API_KEY;
  const GEMINI = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  let reply = '';
  if (GROQ) { try { reply = await viaGroq(GROQ, history); } catch {} }
  if (!reply && GEMINI) { try { reply = await viaGemini(GEMINI, history); } catch {} }
  if (!reply) { reply = getSmartFallbackReply(lastUserQuery); }

  return json(res, 200, { reply });
}
