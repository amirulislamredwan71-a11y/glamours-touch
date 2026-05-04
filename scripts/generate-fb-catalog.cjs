const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY is missing!');
  console.error('');
  console.error('প্রজেক্ট root-এ একটি .env ফাইল বানান এবং এটি লিখুন:');
  console.error('  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
  console.error('');
  console.error('Supabase key পাবেন: https://supabase.com → আপনার project → Settings → API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function generateCatalogs() {
  console.log('Fetching products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products. Generating 2 Catalog files...`);

  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category'];
  
  const standardRows = [headers.join(',')];
  const directRows = [headers.join(',')];

  for (const product of products) {
    const common = [
      `"${product.id}"`,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${stripHtml(product.description).replace(/"/g, '""')}"`,
      '"in stock"',
      '"new"',
      `"${product.price} BDT"`,
    ];
    const imageLink = `"${product.image}"`;
    const brand = `"${(product.brand || 'Glamours Touch').replace(/"/g, '""')}"`;
    const category = '"Health & Beauty > Personal Care > Cosmetics"';

    // Standard Link
    const standardLink = `"https://glamourstouch.com/product/${product.id}"`;
    standardRows.push([...common, standardLink, imageLink, brand, category].join(','));

    // Direct Checkout Link
    const directLink = `"https://glamourstouch.com/checkout?product_id=${product.id}"`;
    directRows.push([...common, directLink, imageLink, brand, category].join(','));
  }

  fs.writeFileSync('facebook-catalog.csv', standardRows.join('\n'));
  fs.writeFileSync('facebook-direct-checkout.csv', directRows.join('\n'));
  
  console.log('✅ Success! 2 files created:');
  console.log('1. facebook-catalog.csv (Standard)');
  console.log('2. facebook-direct-checkout.csv (Direct Checkout)');
}

generateCatalogs();
