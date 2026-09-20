import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';
const supabase = createClient(supabaseUrl, supabaseKey);

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('[Sitemap Generator] Fetching products, categories, and blogs from Supabase...');
  const [{ data: products }, { data: categories }, { data: blogs }] = await Promise.all([
    supabase.from('products').select('id, name, brand, image, created_at'),
    supabase.from('categories').select('name'),
    supabase.from('blogs').select('slug, title, title_bn, image, updated_at, created_at').eq('published', true)
  ]);

  const today = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://glamourstouch.com';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // 1. Static Core Landing Pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/shop', priority: '0.95', changefreq: 'daily' },
    { url: '/glow-predictor', priority: '0.90', changefreq: 'weekly' },
    { url: '/blog', priority: '0.90', changefreq: 'daily' },
    { url: '/about', priority: '0.70', changefreq: 'monthly' },
    { url: '/contact', priority: '0.70', changefreq: 'monthly' },
    { url: '/faq', priority: '0.70', changefreq: 'monthly' },
    { url: '/shipping-policy', priority: '0.50', changefreq: 'monthly' },
    { url: '/returns-exchanges', priority: '0.50', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.40', changefreq: 'monthly' },
    { url: '/terms-of-service', priority: '0.40', changefreq: 'monthly' }
  ];

  staticPages.forEach(p => {
    xml += `  <url>\n    <loc>${baseUrl}${p.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  });

  // 2. Category Landing Pages
  if (categories && categories.length > 0) {
    categories.forEach(c => {
      xml += `  <url>\n    <loc>${baseUrl}/shop?category=${encodeURIComponent(c.name)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });
  }

  // 3. Blog Articles with Google Image Extension
  if (blogs && blogs.length > 0) {
    blogs.forEach(b => {
      const date = b.updated_at ? b.updated_at.split('T')[0] : (b.created_at ? b.created_at.split('T')[0] : today);
      xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n`;
      if (b.image) {
        xml += `    <image:image>\n      <image:loc>${xmlEscape(b.image)}</image:loc>\n      <image:title>${xmlEscape(b.title_bn || b.title)}</image:title>\n      <image:caption>${xmlEscape(b.title)}</image:caption>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  // 4. Products with Google Image Extension
  if (products && products.length > 0) {
    products.forEach(p => {
      const date = p.updated_at ? p.updated_at.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : today);
      xml += `  <url>\n    <loc>${baseUrl}/product/${p.id}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n`;
      if (p.image) {
        xml += `    <image:image>\n      <image:loc>${xmlEscape(p.image)}</image:loc>\n      <image:title>${xmlEscape(p.name)}</image:title>\n      <image:caption>${xmlEscape(p.brand || "Glamour's Touch")}</image:caption>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });
  }

  xml += '</urlset>\n';

  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');

  const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    fs.writeFileSync(distPath, xml, 'utf8');
  }

  const totalUrls = staticPages.length + (categories?.length || 0) + (blogs?.length || 0) + (products?.length || 0);
  console.log(`✅ Successfully generated Google Image Sitemap with ${totalUrls} URLs (Blogs: ${blogs?.length || 0}, Products: ${products?.length || 0})!`);
}

generateSitemap();
