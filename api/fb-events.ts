import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 50_000) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const json = (res: VercelResponse, code: number, obj: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(code).send(JSON.stringify(obj));
};

// The single pixel every campaign is wired to (see index.html) — kept in sync manually.
// (2026-08-16: the earlier fix targeted the wrong Vercel project — this repo's Vercel-connected
// deploy target is prj_vB9pFH3Ax6xx0L80wG8r789hG2FG under the amirulislamredwan71-a11y account,
// not the khondokartowsif171-owned "glamours-touch" project. Re-fixed META_CAPI_ACCESS_TOKEN
// there; this commit triggers the actual production build.)
const PIXEL_ID = '988182894209503';

// Server-side mirror of the browser Meta Pixel (Conversions API). Reaches Meta even when
// an ad blocker or iOS privacy setting drops the browser-side fbq() call. Shares the same
// event_id the client sent to fbq() so Meta deduplicates the two deliveries into one event.
export default async function handler(req: IncomingMessage & { method?: string; headers: Record<string, any> }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!TOKEN) return json(res, 200, { skipped: true }); // fail open — browser pixel already covers this event

  let body: any;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'bad body' }); }

  const { event_name, event_id, event_source_url, custom_data, fbp, fbc } = body || {};
  if (!event_name || !event_id) return json(res, 400, { error: 'event_name and event_id required' });

  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const user_data: Record<string, any> = {
    client_user_agent: String(req.headers['user-agent'] || ''),
  };
  if (xff) user_data.client_ip_address = xff;
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name,
          event_id,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url,
          action_source: 'website',
          user_data,
          custom_data,
        }],
        access_token: TOKEN,
      }),
    });
    const d = await r.json();
    return json(res, 200, { ok: true, meta: d });
  } catch (e: any) {
    return json(res, 200, { ok: false, error: String(e?.message || e).slice(0, 120) });
  }
}
