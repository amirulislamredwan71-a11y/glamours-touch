import fs from 'fs';
import path from 'path';

const SUPA_URL = 'https://fmcltrjnuvuooarkvufn.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';

async function generatePromotionsFeed() {
  console.log('🔄 Generating Google Merchant Center Promotions Feed (XML & CSV)...');

  // Fetch active products with discounts from Supabase DB
  const res = await fetch(`${SUPA_URL}/rest/v1/products?select=*&in_stock=eq.true`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`
    }
  });

  const products = await res.json();
  const discounted = products.filter(p => p.market_price && p.market_price > p.price);

  const startDate = '2026-01-01T00:00:00+06:00';
  const endDate = '2027-12-31T23:59:59+06:00';
  const effectiveDates = `${startDate}/${endDate}`;

  // 1. Generate XML Feed (google-promotions.xml)
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Glamour's Touch Promotions Feed</title>
    <link>https://glamourstouch.com</link>
    <description>Google Merchant Center Promotions Feed for 100% Authentic Korean Cosmetics Bangladesh</description>

    <!-- Promotion 1: Storewide K-Beauty Discount Offer -->
    <item>
      <g:promotion_id>GT_KBEAUTY_DISCOUNT_2026</g:promotion_id>
      <g:target_country>BD</g:target_country>
      <g:content_language>en</g:content_language>
      <g:promotion_effective_dates>${effectiveDates}</g:promotion_effective_dates>
      <g:redemption_channel>ONLINE</g:redemption_channel>
      <g:promotion_display_dates>${effectiveDates}</g:promotion_display_dates>
      <g:title>Up to 28% Off Authentic Korean Cosmetics &amp; Skincare Routines</g:title>
      <g:long_title>Get up to 28% instant discount on authentic Korean cosmetics including DABO, COSRX, AXIS-Y, Anua and Beauty of Joseon</g:long_title>
      <g:offer_type>NO_CODE</g:offer_type>
      <g:product_applicability>ALL_PRODUCTS</g:product_applicability>
    </item>

    <!-- Promotion 2: Free Delivery on AI Custom Routine Combos -->
    <item>
      <g:promotion_id>GT_FREE_SHIPPING_COMBO</g:promotion_id>
      <g:target_country>BD</g:target_country>
      <g:content_language>en</g:content_language>
      <g:promotion_effective_dates>${effectiveDates}</g:promotion_effective_dates>
      <g:redemption_channel>ONLINE</g:redemption_channel>
      <g:promotion_display_dates>${effectiveDates}</g:promotion_display_dates>
      <g:title>Free Fast Home Delivery Nationwide in Bangladesh on Combo Routines</g:title>
      <g:long_title>Enjoy 100% free cash on delivery shipping across all 64 districts in Bangladesh on AI Glow Routine Combos</g:long_title>
      <g:offer_type>NO_CODE</g:offer_type>
      <g:product_applicability>ALL_PRODUCTS</g:product_applicability>
      <g:shipping_option_price>0.00 BDT</g:shipping_option_price>
    </item>

    <!-- Promotion 3: Special DABO Black Snail & Tone-Up Cream Promo -->
    <item>
      <g:promotion_id>GT_DABO_SPECIAL_OFFER</g:promotion_id>
      <g:target_country>BD</g:target_country>
      <g:content_language>en</g:content_language>
      <g:promotion_effective_dates>${effectiveDates}</g:promotion_effective_dates>
      <g:redemption_channel>ONLINE</g:redemption_channel>
      <g:promotion_display_dates>${effectiveDates}</g:promotion_display_dates>
      <g:title>Special Discount on DABO Korean Tone-Up &amp; Black Snail All-In-One Cream</g:title>
      <g:long_title>Special promo offer on 100% original DABO Black Snail and Glutathione Brightening Tone-Up Creams</g:long_title>
      <g:offer_type>NO_CODE</g:offer_type>
      <g:product_applicability>ALL_PRODUCTS</g:product_applicability>
    </item>
  </channel>
</rss>`;

  const xmlPath = path.join(process.cwd(), 'public', 'google-promotions.xml');
  fs.writeFileSync(xmlPath, xmlContent);
  console.log('✅ Generated public/google-promotions.xml!');

  // 2. Generate CSV Feed (google-promotions.csv)
  const csvHeaders = 'promotion_id,target_country,content_language,promotion_effective_dates,redemption_channel,promotion_display_dates,title,long_title,offer_type,product_applicability,shipping_option_price\n';
  const csvRows = [
    `GT_KBEAUTY_DISCOUNT_2026,BD,en,"${effectiveDates}",ONLINE,"${effectiveDates}","Up to 28% Off Authentic Korean Cosmetics","Get up to 28% instant discount on authentic Korean cosmetics including DABO, COSRX, AXIS-Y, Anua and Beauty of Joseon",NO_CODE,ALL_PRODUCTS,`,
    `GT_FREE_SHIPPING_COMBO,BD,en,"${effectiveDates}",ONLINE,"${effectiveDates}","Free Home Delivery Nationwide on Combo Routines","Enjoy 100% free cash on delivery shipping across all 64 districts in Bangladesh on AI Glow Routine Combos",NO_CODE,ALL_PRODUCTS,0.00 BDT`,
    `GT_DABO_SPECIAL_OFFER,BD,en,"${effectiveDates}",ONLINE,"${effectiveDates}","Special Discount on DABO Korean Tone-Up & Black Snail Cream","Special promo offer on 100% original DABO Black Snail and Glutathione Brightening Tone-Up Creams",NO_CODE,ALL_PRODUCTS,`
  ].join('\n');

  const csvPath = path.join(process.cwd(), 'public', 'google-promotions.csv');
  fs.writeFileSync(csvPath, csvHeaders + csvRows);
  console.log('✅ Generated public/google-promotions.csv!');
}

generatePromotionsFeed();
