import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

// Public Supabase anon key (safe to expose — same key ships in the frontend bundle).
const SUPA_URL = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';

const BASE = 'https://www.glamourstouch.com';
const esc = (v: any) => {
  const s = String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Meta / Facebook product catalog feed (CSV) auto-generated from the live Supabase catalog.
// Powers Dynamic Product Ads (retargeting shows each visitor the exact products they viewed).
export default async function handler(_req: IncomingMessage, res: VercelResponse) {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/products?select=id,name,description,price,market_price,image,brand,in_stock&limit=2000`,
      { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } },
    );
    const products: any[] = await r.json();
    const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'sale_price', 'link', 'image_link', 'brand', 'google_product_category'];
    const rows = [header.join(',')];
    for (const p of Array.isArray(products) ? products : []) {
      if (!p.id || !p.name || !p.image) continue;
      const price = Number(p.price) || 0;
      const market = Number(p.market_price) || 0;
      const hasSale = market > price;
      rows.push([
        esc(p.id),
        esc(p.name),
        esc((p.description && String(p.description).replace(/<[^>]*>/g, ' ').trim()) || p.name),
        p.in_stock === false ? 'out of stock' : 'in stock',
        'new',
        `${(hasSale ? market : price).toFixed(2)} BDT`,
        hasSale ? `${price.toFixed(2)} BDT` : '',
        `${BASE}/product/${p.id}`,
        esc(p.image),
        esc(p.brand || "Glamour's Touch"),
        'Health & Beauty > Personal Care > Cosmetics > Skin Care',
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.status(200).send(rows.join('\n'));
  } catch (e: any) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('feed error: ' + String(e?.message || e));
  }
}
