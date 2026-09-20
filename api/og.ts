import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest  = IncomingMessage & { query: Record<string, string | string[]> };
type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send:   (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};
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

  // `description` is an internal "Minimum Retail Selling Price" note for most of the catalog, not
  // a real customer-facing description (see ProductDetail.tsx's own guard for the same field) --
  // this route feeds Facebook/WhatsApp link-preview crawlers directly, so leaking it here means it
  // shows up in a real shared post's caption card, not just a hidden page field (confirmed live,
  // 2026-08-28: "The Face Shop · ৳1,250. Minimum Retail Selling Price: ৳ 1,200" on a real post).
  const rawDesc = p.description ?? '';
  const plainDesc = /minimum\s+retail\s+selling\s+price/i.test(rawDesc)
    ? ''
    : rawDesc.replace(/<[^>]*>/g, '').slice(0, 120);
  const pageUrl   = `https://www.glamourstouch.com/product/${p.id}`;
  const imageUrl  = p.image;
  const title     = `${p.name} — 100% Original Price in BD | Glamour's Touch`;
  const desc      = `Buy authentic ${p.brand || 'Korean'} ${p.name} at Glamour's Touch Bangladesh for ৳${p.price.toLocaleString()}. 100% authentic Korean cosmetics with Cash on Delivery across BD.`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.name,
    "image": [imageUrl],
    "description": plainDesc || desc,
    "sku": p.id,
    "brand": {
      "@type": "Brand",
      "name": p.brand || "Korean Authentic"
    },
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": "BDT",
      "price": String(p.price),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Glamour's Touch"
      }
    }
  };

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${pageUrl}" />
  <meta name="description" content="${escapeHtml(desc)}" />
  
  <meta property="og:title"       content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:image"       content="${imageUrl}" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:type"        content="product" />
  <meta property="og:site_name"   content="Glamour's Touch" />
  <meta property="product:price:amount"   content="${p.price}" />
  <meta property="product:price:currency" content="BDT" />
  
  <meta name="twitter:card"  content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta property="fb:app_id" content="1322315399797461" />

  <script type="application/ld+json">
  ${JSON.stringify(jsonLd)}
  </script>
</head>
<body style="font-family:sans-serif;background:#080c16;color:#fff;padding:24px;text-align:center;">
  <h1>${escapeHtml(p.name)}</h1>
  <p style="color:#e5b83a;font-size:20px;font-weight:bold;">৳${p.price.toLocaleString()}</p>
  <p>${escapeHtml(desc)}</p>
  <a href="/product/${p.id}" style="color:#e5b83a;text-decoration:underline;">View on Glamour's Touch</a>
</body>
</html>`);
}
