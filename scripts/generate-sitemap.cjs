const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const BASE_URL = 'https://glamourstouch.com';
const supabaseUrl = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STATIC_PAGES = [
  { url: '/',              priority: '1.0', changefreq: 'daily' },
  { url: '/shop',          priority: '0.9', changefreq: 'daily' },
  { url: '/about',         priority: '0.6', changefreq: 'monthly' },
  { url: '/contact',       priority: '0.6', changefreq: 'monthly' },
  { url: '/track-order',   priority: '0.7', changefreq: 'monthly' },
  { url: '/faq',           priority: '0.5', changefreq: 'monthly' },
  { url: '/shipping',      priority: '0.5', changefreq: 'monthly' },
  { url: '/returns',       priority: '0.5', changefreq: 'monthly' },
  { url: '/privacy',       priority: '0.4', changefreq: 'yearly' },
  { url: '/terms',         priority: '0.4', changefreq: 'yearly' },
];

async function generateSitemap() {
  console.log('Fetching products & categories...');

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id, updated_at'),
    supabase.from('categories').select('name'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  const urls = [
    ...STATIC_PAGES.map(p => ({
      loc:        `${BASE_URL}${p.url}`,
      lastmod:    today,
      changefreq: p.changefreq,
      priority:   p.priority,
    })),
    ...(categories || []).map(c => ({
      loc:        `${BASE_URL}/shop?category=${encodeURIComponent(c.name)}`,
      lastmod:    today,
      changefreq: 'weekly',
      priority:   '0.7',
    })),
    ...(products || []).map(p => ({
      loc:        `${BASE_URL}/product/${p.id}`,
      lastmod:    (p.updated_at || today).split('T')[0],
      changefreq: 'weekly',
      priority:   '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
  console.log(`✅ sitemap.xml generated — ${urls.length} URLs (${products?.length || 0} products)`);
}

generateSitemap();
