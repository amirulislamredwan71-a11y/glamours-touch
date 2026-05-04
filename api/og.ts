import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).send('Missing id');

  const { data: p } = await supabase
    .from('products')
    .select('id, name, brand, price, image, description')
    .eq('id', id)
    .single();

  if (!p) return res.status(404).send('Not found');

  const plainDesc = p.description?.replace(/<[^>]*>/g, '').slice(0, 120) ?? '';
  const pageUrl   = `https://glamourstouch.com/product/${p.id}`;
  const imageUrl  = `https://res.cloudinary.com/dgidarjkt/image/fetch/q_auto,f_auto/${encodeURIComponent(p.image)}`;
  const title     = `${p.name} — Glamour's Touch`;
  const desc      = `${p.brand} · ৳${p.price.toLocaleString()}. ${plainDesc}`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta property="og:title"       content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:image"       content="${imageUrl}" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:type"        content="product" />
  <meta property="og:site_name"   content="Glamour's Touch" />
  <meta property="product:price:amount"   content="${p.price}" />
  <meta property="product:price:currency" content="BDT" />
  <meta name="twitter:card"  content="summary_large_image" />
  <meta property="fb:app_id" content="1322315399797461" />
  <meta property="fb:app_id" content="1322315399797461" />
>>   <meta name="twitter:image" content="${imageUrl}" />
  <script>window.location.href="/product/${p.id}";</script>
</head>
<body>
  <a href="/product/${p.id}">${escapeHtml(p.name)}</a>
</body>
</html>`);
}
