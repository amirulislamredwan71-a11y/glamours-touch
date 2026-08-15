import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'fs';
import path from 'path';

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

let cachedCatalog: any[] = [];
function getCatalog(): any[] {
  if (cachedCatalog.length) return cachedCatalog;
  try {
    const filePath = path.join(process.cwd(), 'api', 'catalog_knowledge.json');
    if (fs.existsSync(filePath)) {
      cachedCatalog = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {}
  return cachedCatalog;
}

function searchCatalogProducts(query: string): any[] {
  const catalog = getCatalog();
  if (!catalog.length) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);

  return catalog.filter(p => {
    const pName = p.name.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    const pDesc = p.desc.toLowerCase();
    return words.some(w => pName.includes(w) || pBrand.includes(w) || pDesc.includes(w));
  }).slice(0, 4);
}

function buildBulletproofResponse(query: string): string {
  const matches = searchCatalogProducts(query);
  const q = query.toLowerCase();

  if (matches.length > 0) {
    let resText = `🌸 **ত্বকের যত্নে আমাদের পরামর্শ ও অরিজিনাল কোরিয়ান সমাধান:**\n\n`;
    resText += `🌿 **দৈনন্দিন জীবনযাপন পরামর্শ:** পর্যাপ্ত পানি পান করুন (২.৫-৩ লিটার), মিষ্টি ও ভাজাপোড়া খাবার কমিয়ে আনুন এবং রাতে ত্বকে কেমিক্যাল না জমিয়ে ডাবল ক্লিনজিং করুন।\n\n`;
    matches.forEach(p => {
      const disc = Math.round(((p.market_price - p.price) / p.market_price) * 100);
      resText += `🌟 **${p.name}** (${p.brand})\n`;
      resText += `💰 **অফার প্রাইজ:** ৳${p.price} (বাজার মূল্য: ৳${p.market_price} — ${disc}% ছাড়!)\n`;
      resText += `✨ **উপকারিতা:** ${p.desc || '১০০% অরিজিনাল কোরিয়ান ফরম্যুলা, যা ত্বকে কোনো সাইড ইফেক্ট ছাড়াই দ্রুত দৃশ্যমান গ্লো ও স্কিন ব্যারিয়ার রিপেয়ার করে।'}\n`;
      resText += `🧴 **ব্যবহারের নিয়ম:** প্রতিদিন সকালে ও রাতে টোনারের পর হালকা হাতে ম্যাসাজ করে ব্যবহার করুন।\n\n`;
    });
    resText += `🛍️ সরাসরি অর্ডারের জন্য ওয়েবসাইট ভিজিট করুন অথবা হোয়াটসঅ্যাপে নক দিন: 01712-426871 ✨`;
    return resText;
  }

  if (q.includes('ব্রণ') || q.includes('acne') || q.includes('pimple') || q.includes('বিচি')) {
    return '🌿 **ব্রণ দূর করার প্রাকৃতিক পরামর্শ:**\n১. প্রতিদিন ৩ লিটার পানি পান করুন ও মিষ্টি/অতিরিক্ত তেলে ভাজা খাবার পরিহার করুন।\n২. রাতে তোয়ালে দিয়ে মুখ ঘষে না মুছে নরম সুতি কাপড় ব্যবহার করুন।\n\n🌟 **উপযুক্ত প্রোডাক্ট:** SKIN1004 Madagascar Centella Ampoule (৳১,৭৫০)\n💰 **অফার প্রাইজ:** ৳১,৭৫০ (বাজার মূল্য ৳২,২০০)\n✨ **উপকারিতা:** ব্রণের লালচে ভাব, পিম্পল ব্যাকটেরিয়া এবং ত্বকের জ্বালা-পোড়া শান্ত করে।\n🧴 **ব্যবহারের নিয়ম:** মুখ ধুয়ে ২-৩ ফোঁটা দিয়ে মুখে হালকা চাপ দিয়ে বসিয়ে দিন।\n\n🛍️ ওয়েবসাইট বা হোয়াটসঅ্যাপে অর্ডার করুন: 01712-426871 ✨';
  }

  if (q.includes('দাগ') || q.includes('মেছতা') || q.includes('spot') || q.includes('dark') || q.includes('pigmentation')) {
    return '🌿 **দাগ ও মেছতা হালকা করার প্রাকৃতিক পরামর্শ:**\n১. রোদে বের হওয়ার ১৫ মিনিট আগে অবশ্যই সানস্ক্রিন ব্যবহার করুন (সূর্যের আল্ট্রাভায়োলেট রশ্মি দাগ বাড়িয়ে দেয়)।\n২. ত্বকের ব্যারিয়ার ড্যামেজ রোধ করতে রাতে মাইল্ড ক্লিনজার ব্যবহার করুন।\n\n🌟 **উপযুক্ত প্রোডাক্ট:** AXIS-Y Dark Spot Correcting Glow Serum (৳১,৬০০)\n💰 **অফার প্রাইজ:** ৳১,৬০০ (বাজার মূল্য ৳২,১১০ — ২৪% ছাড়!)\n✨ **উপকারিতা:** ৫% নিয়াসিনামাইড ও পেঁপে এক্সট্র্যাক্ট যা ক্ষতের কালো দাগ, মেছতা ও একনে স্কার দ্রুত হালকা করে।\n🧴 **ব্যবহারের নিয়ম:** রাতে সিরাম হিসেবে নিয়মিত মুখে ব্যবহার করুন।\n\n🛍️ ওয়েবসাইট বা হোয়াটসঅ্যাপে অর্ডার করুন: 01712-426871 ✨';
  }

  return 'গ্ল্যামারস টাচে আপনাকে স্বাগতম! 🌸 আমরা শুধু প্রোডাক্ট বিক্রি করি না, কাস্টমারের ত্বকের সত্যিকারের যত্ন ও সঠিক পরামর্শ দেওয়া আমাদের মূল লক্ষ্য। যেকোনো স্কিন সমস্যা (ব্রণ, দাগ, শুষ্কতা, পোরস) নিয়ে প্রশ্ন করুন, পেয়ে যাবেন প্রাকৃতিক পরামর্শ ও ১০০% অরিজিনাল কোরিয়ান সমাধানের সঠিক দাম (৳)। অর্ডারে কল/হোয়াটসঅ্যাপ: 01712-426871 ✨';
}

const SYSTEM = `You are "Glow Advisor", a compassionate, world-class K-Beauty skincare mentor & holistic health advisor for Glamour's Touch (glamourstouch.com).
Your primary goal is NOT just selling products — your core mission is TRULY HELPING PEOPLE heal their skin, build healthy skincare habits, and feel confident.

Rules for your responses:
1. Always reply in warm, respectful, empathetic Bengali.
2. Provide HOLISTIC ADVICE FIRST: Include natural lifestyle tips (hydration 2.5-3L water, avoiding excess sugar/oily foods for acne, 8-hour sleep, stress reduction, double cleansing, sun protection, patch testing).
3. If recommending products, ALWAYS state the exact BDT Price (৳), exact Benefits (উপকারিতা), and clear Usage Instructions (ব্যবহারের নিয়ম).
4. Be honest: Recommend simple 1-2 product routines if that's all the person needs. Never force unnecessary products.
5. If the user has severe cystic acne, eczema, or painful skin infections, gently advise consulting a professional dermatologist.`;

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
  if (!reply) { reply = buildBulletproofResponse(lastUserQuery); }

  return json(res, 200, { reply });
}
