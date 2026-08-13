const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function generateCatalogs() {
  console.log('Fetching products from Supabase for Meta Catalog Feed...');
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products. Generating Meta Commerce & Messenger Catalogs...`);

  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category', 'messenger_link'];
  
  const standardRows = [headers.join(',')];
  const directRows = [headers.join(',')];

  for (const product of products) {
    const messengerLink = `"https://m.me/1002146686323797?ref=${product.id}"`;
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
    standardRows.push([...common, standardLink, imageLink, brand, category, messengerLink].join(','));

    // Direct Checkout Link
    const directLink = `"https://glamourstouch.com/checkout?product_id=${product.id}"`;
    directRows.push([...common, directLink, imageLink, brand, category, messengerLink].join(','));
  }

  fs.writeFileSync('facebook-catalog.csv', standardRows.join('\n'));
  fs.writeFileSync('facebook-direct-checkout.csv', directRows.join('\n'));
  
  console.log('✅ Success! Meta Catalog Files updated with Messenger Referral Tags:');
  console.log('1. facebook-catalog.csv (Standard + Messenger Ref)');
  console.log('2. facebook-direct-checkout.csv (Direct Checkout + Messenger Ref)');
}

generateCatalogs();
