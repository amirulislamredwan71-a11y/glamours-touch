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

async function generateRSS() {
  console.log('[RSS Generator] Fetching latest blog posts and trending products...');
  const [{ data: blogs }, { data: products }] = await Promise.all([
    supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('isFeatured', true).limit(20)
  ]);

  const baseUrl = 'https://www.glamourstouch.com';
  const pubDate = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Glamour's Touch | Authentic Korean Skincare &amp; Beauty Bangladesh</title>
    <link>${baseUrl}</link>
    <description>Latest Korean skincare routines, K-Beauty tips, authentic product guides and reviews in Bangladesh.</description>
    <language>bn-BD</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Glamour's Touch</title>
      <link>${baseUrl}</link>
    </image>
`;

  if (blogs && blogs.length > 0) {
    blogs.forEach(b => {
      const itemDate = new Date(b.created_at).toUTCString();
      rss += `    <item>
      <title>${xmlEscape(b.title_bn || b.title)}</title>
      <link>${baseUrl}/blog/${b.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${b.slug}</guid>
      <pubDate>${itemDate}</pubDate>
      <dc:creator>${xmlEscape(b.author || "Glamour's Touch")}</dc:creator>
      <category>${xmlEscape(b.category || "Skincare")}</category>
      <description><![CDATA[${b.excerpt || ''}]]></description>
      ${b.image ? `<enclosure url="${xmlEscape(b.image)}" type="image/jpeg" length="0" />` : ''}
    </item>
`;
    });
  }

  if (products && products.length > 0) {
    products.forEach(p => {
      const itemDate = new Date(p.created_at || Date.now()).toUTCString();
      rss += `    <item>
      <title>${xmlEscape(p.name)} - ৳${p.price}</title>
      <link>${baseUrl}/product/${p.id}</link>
      <guid isPermaLink="true">${baseUrl}/product/${p.id}</guid>
      <pubDate>${itemDate}</pubDate>
      <category>Product</category>
      <description><![CDATA[${p.description ? p.description.slice(0, 300) : p.name} - Buy authentic Korean cosmetics in Bangladesh. Price: ৳${p.price}]]></description>
      ${p.image ? `<enclosure url="${xmlEscape(p.image)}" type="image/jpeg" length="0" />` : ''}
    </item>
`;
    });
  }

  rss += `  </channel>
</rss>`;

  const publicPath = path.join(process.cwd(), 'public', 'rss.xml');
  fs.writeFileSync(publicPath, rss, 'utf8');

  const distPath = path.join(process.cwd(), 'dist', 'rss.xml');
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    fs.writeFileSync(distPath, rss, 'utf8');
  }

  console.log(`✅ Successfully generated RSS 2.0 Feed with ${blogs?.length || 0} blogs and ${products?.length || 0} featured products!`);
}

generateRSS();
