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
    let resText = `গ্ল্যামারস টাচের ১০০% অরিজিনাল কোরিয়ান প্রোডাক্ট ও উপকারিতা:\n\n`;
    matches.forEach(p => {
      const disc = Math.round(((p.market_price - p.price) / p.market_price) * 100);
      resText += `🌟 **${p.name}** (${p.brand})\n`;
      resText += `💰 **অফার প্রাইজ:** ৳${p.price} (বাজার মূল্য: ৳${p.market_price} — ${disc}% ছাড়!)\n`;
      resText += `✨ **উপকারিতা:** ${p.desc || '১০০% অরিজিনাল কোরিয়ান ফরম্যুলা, যা ত্বকে কোনো সাইড ইফেক্ট ছাড়াই দ্রুত দৃশ্যমান গ্লো ও স্কিন ব্যারিয়ার রিপেয়ার করে।'}\n`;
      resText += `🧴 **ব্যবহারের নিয়ম:** প্রতিদিন সকালে ও রাতে টোনারের পর হালকা হাতে ম্যাসাজ করে ব্যবহার করুন।\n\n`;
    });
    resText += `🛍️ অর্ডারের জন্য ওয়েবসাইটের শপ মেনু ভিজিট করুন অথবা হোয়াটসঅ্যাপে নক দিন: 01712-426871 ✨`;
    return resText;
  }

  if (q.includes('ব্রণ') || q.includes('acne') || q.includes('pimple') || q.includes('বিচি')) {
    return '🌟 **SKIN1004 Madagascar Centella Ampoule** (৳১,৭৫০)\n💰 **অফার প্রাইজ:** ৳১,৭৫০ (বাজার মূল্য ৳২,২০০)\n✨ **উপকারিতা:** ব্রণের লালচে ভাব, পিম্পল ব্যাকটেরিয়া এবং ত্বকের জ্বালা-পোড়া দূর করতে জাদুকরী কাজ করে।\n🧴 **ব্যবহারের নিয়ম:** মুখ ধুয়ে ২-৩ ফোঁটা দিয়ে মুখে হালকা চাপ দিয়ে বসিয়ে দিন।\n\n🛍️ ওয়েবসাইট বা হোয়াটসঅ্যাপে অর্ডার করুন: 01712-426871 ✨';
  }

  if (q.includes('দাগ') || q.includes('মেছতা') || q.includes('spot') || q.includes('dark') || q.includes('pigmentation')) {
    return '🌟 **AXIS-Y Dark Spot Correcting Glow Serum** (৳১,৬০০)\n💰 **অফার প্রাইজ:** ৳১,৬০০ (বাজার মূল্য ৳২,১১০ — ২৪% ছাড়!)\n✨ **উপকারিতা:** ৫% নিয়াসিনামাইড ও পেঁপে এক্সট্র্যাক্ট যা ক্ষতের কালো দাগ, মেছতা ও একনে স্কার দ্রুত হালকা করে গ্লাস গ্লো নিয়ে আসে।\n🧴 **ব্যবহারের নিয়ম:** রাতে সিরাম হিসেবে নিয়মিত মুখে ব্যবহার করুন।\n\n🛍️ ওয়েবসাইট বা হোয়াটসঅ্যাপে অর্ডার করুন: 01712-426871 ✨';
  }

  if (q.includes('সানস্ক্রিন') || q.includes('sun') || q.includes('sunscreen') || q.includes('রোদে')) {
    return '🌟 **Beauty of Joseon Relief Sun: Rice + Probiotics** (৳১,৬০০)\n💰 **অফার প্রাইজ:** ৳১,৬০০ (বাজার মূল্য ৳২,২২০ — ২৮% ছাড়!)\n✨ **উপকারিতা:** SPF50+ PA++++ ব্রড স্পেকট্রাম রোদ সুরক্ষা। ক্ষতিকর UV রশি ও ট্যান প্রতিরোধ করে এবং ত্বকে প্রাকৃতিক গ্লো দেয়।\n🧴 **ব্যবহারের নিয়ম:** বাইরে বের হওয়ার ১৫ মিনিট আগে মুখে ও ঘাড়ে লাগান।\n\n🛍️ ওয়েবসাইট বা হোয়াটসঅ্যাপে অর্ডার করুন: 01712-426871 ☀️';
  }

  return 'গ্ল্যামারস টাচে পাচ্ছেন ৫৬৩+ ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার প্রোডাক্ট! যেকোনো প্রোডাক্টের নাম বা স্কিন সমস্যা লিখে জানান (যেমন: Axis-Y, Beauty of Joseon, COSRX, Anua, Medicube, Dabo, Centella), সাথে সাথে অরিজিনাল দাম (৳), উপকারিতা ও ব্যবহারের নিয়ম পেয়ে যাবেন। সরাসরি অর্ডারে কল/হোয়াটসঅ্যাপ: 01712-426871 🌸';
}

const SYSTEM = `You are "Glow Advisor", the master AI skincare expert of Glamour's Touch (গ্ল্যামারস টাচ) — Bangladesh's 100% authentic Korean cosmetics shop (glamourstouch.com).
Reply in Bengali. Keep it highly informative, respectful, clear and direct.

CRITICAL MANDATE:
Whenever a user asks about ANY product, price, benefits (উপকারিতা), or skincare concern, ALWAYS provide:
1. Product Name & Brand
2. Exact BDT Offer Price (৳) and Market Price Discount
3. Exact Skincare Benefits (উপকারিতা) and Key Ingredients
4. Usage Instructions (ব্যবহারের নিয়ম)
5. Direct Order Call-to-Action (glamourstouch.com or WhatsApp 01712-426871)

Never give generic excuses, never say "prices change", and never say "check website". State exact facts cheerfully!`;

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
