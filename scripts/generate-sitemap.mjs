import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  const [{ data: products }, { data: categories }, { data: blogs }] = await Promise.all([
    supabase.from('products').select('id, created_at'),
    supabase.from('categories').select('name'),
    supabase.from('blog_posts').select('slug, updated_at, created_at')
  ]);

  const today = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://www.glamourstouch.com';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/shop', priority: '0.95', changefreq: 'daily' },
    { url: '/glow-predictor', priority: '0.90', changefreq: 'weekly' },
    { url: '/blog', priority: '0.85', changefreq: 'daily' },
    { url: '/about', priority: '0.70', changefreq: 'monthly' },
    { url: '/contact', priority: '0.70', changefreq: 'monthly' },
    { url: '/faq', priority: '0.60', changefreq: 'monthly' },
    { url: '/shipping-policy', priority: '0.50', changefreq: 'monthly' },
    { url: '/returns-exchanges', priority: '0.50', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.40', changefreq: 'monthly' },
    { url: '/terms-of-service', priority: '0.40', changefreq: 'monthly' }
  ];

  staticPages.forEach(p => {
    xml += `  <url>\n    <loc>${baseUrl}${p.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  });

  if (categories) {
    categories.forEach(c => {
      xml += `  <url>\n    <loc>${baseUrl}/shop?category=${encodeURIComponent(c.name)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });
  }

  if (blogs) {
    blogs.forEach(b => {
      const date = b.updated_at ? b.updated_at.split('T')[0] : (b.created_at ? b.created_at.split('T')[0] : today);
      xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
    });
  }

  if (products) {
    products.forEach(p => {
      const date = p.created_at ? p.created_at.split('T')[0] : today;
      xml += `  <url>\n    <loc>${baseUrl}/product/${p.id}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.80</priority>\n  </url>\n`;
    });
  }

  xml += '</urlset>\n';

  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf8');
  console.log(`Successfully generated full sitemap.xml with ${staticPages.length + (categories?.length||0) + (blogs?.length||0) + (products?.length||0)} URLs!`);
}

generateSitemap();
