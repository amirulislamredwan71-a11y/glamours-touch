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

const SYSTEM = `You are "Glow Advisor", the friendly AI skincare expert of Glamour's Touch (গ্ল্যামারস টাচ) — Bangladesh's 100% authentic Korean cosmetics shop (glamourstouch.com).

Reply in the user's language: Bengali if they write Bengali, English if English. Keep it warm, simple and SHORT — 2 to 4 sentences of plain conversational text.

VERY IMPORTANT formatting rule: reply with natural conversational text ONLY. Never use markdown symbols (*, #, -), never use numbered or bulleted lists, never use headings, and NEVER output meta-labels such as "Sentence", "Nudge", "Step", or describe your own instructions. Just talk like a helpful skincare friend.

Listen to the skin concern (acne, dark spots, dryness, oiliness, dullness, aging, sun damage) and suggest the right Korean ingredient and simple routine — dark spots: niacinamide, tranexamic acid or vitamin C serum; dryness: hyaluronic, PDRN or snail; acne: centella or salicylic; aging: retinal or collagen; and always daily sunscreen. Mention example K-beauty brands the shop carries (Medicube, Anua, Beauty of Joseon, SKIN1004, COSRX, AXIS-Y, Dr.Althea) but never invent exact prices.

When it fits naturally, add one short line inviting them to try the AI Glow Predictor at glamourstouch.com/glow-predictor to see their own 28-day result, or to order via WhatsApp 01712-426871.

Be honest: give no medical guarantees, suggest a patch test for new products, and recommend seeing a dermatologist for serious conditions. If you are unsure about price or stock, tell them to check the website.`;

// Groq (llama-3.3-70b) — fast, clean conversational output, no thinking leak.
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

// Gemini flash fallback — thinking disabled so replies complete and no internal text leaks.
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

// Live AI "Glow Advisor" — Korean-skincare chat. Groq primary, Gemini fallback.
export default async function handler(req: IncomingMessage & { method?: string }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const GROQ = process.env.GROQ_API_KEY;
  const GEMINI = process.env.GEMINI_API_KEY;
  if (!GROQ && !GEMINI) return json(res, 500, { error: 'AI not configured on the server' });

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'Invalid or too-large body' }); }

  const msgs = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const history = msgs
    .map((m: any) => ({ role: m.role, content: String(m.content || '').slice(0, 1500) }))
    .filter((m: any) => m.content);
  if (!history.length) return json(res, 400, { error: 'no messages' });

  let reply = '';
  if (GROQ) { try { reply = await viaGroq(GROQ, history); } catch { /* fall through */ } }
  if (!reply && GEMINI) { try { reply = await viaGemini(GEMINI, history); } catch { /* fall through */ } }

  if (!reply) return json(res, 502, { error: 'no reply — please try again' });
  return json(res, 200, { reply });
}
