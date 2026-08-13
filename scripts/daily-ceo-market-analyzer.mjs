import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const USER_TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const PAGE_ID = '1002146686323797'; // Glamour's Touch FB Page ID
const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

// Trending Market Products with CEO World-Class AI Masterpiece Commercial Campaign Images
const VIRAL_SALES_POSTS = [
  {
    title: "✨ ব্রণের গর্ত ও কালচে দাগ দূর করতে কোরিয়ার বিশ্ববিখ্যাত গ্লাস-স্কিন সিক্রেট — COSRX Advanced Snail 96 Essence!",
    offer: "আজকের সিইও স্পেশাল প্রাইস: ৳১,৩৫০ (অরিজিনাল কোরিয়ান গ্যারান্টি 🇰🇷)",
    content: "ত্বকের ড্যামেজ রিকভারি করে ত্বককে কাচের মতো মসৃণ, সজীব ও গ্লাস-স্কিন টেক্সচার দিতে স্নেইল মিউসিনের জুড়ি নেই। এটি ত্বকের আর্দ্রতা ধরে রেখে বলিরেখা কমায় এবং স্কিন ব্যারিয়ার পুনর্গঠন করে।\n\n✨ ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার কসমেটিকস।\n🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে দেখে টাকা দিন)।",
    link: "https://www.glamourstouch.com/shop?search=Cosrx+Snail+96&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/cosrx_snail_96_masterpiece.jpg",
    hashtags: "#GlamoursTouch #CosrxSnail96 #GlassSkinKorea #KoreanSkincareBD #AuthenticBeauty #GlassSkin"
  }
];

async function runDailyCEOMarketAnalysis() {
  console.log('👑 [CEO AI Agent] Executing Live Market Analysis & World-Class Masterpiece Photo Auto-Posting...');

  const post = VIRAL_SALES_POSTS[0];

  const fullCaption = `${post.title}\n\n💰 ${post.offer}\n\n${post.content}\n\n🛒 অরিজিনাল প্রোডাক্ট সরাসরি অর্ডার করুন:\n👉 ${post.link}\n\n${post.hashtags}`;

  console.log('\n📝 Today\'s CEO Masterpiece Commercial Post:\n', fullCaption);

  if (!USER_TOKEN) {
    console.error('❌ Missing Meta System User Token');
    return;
  }

  try {
    // 1. Fetch Page Access Token from me/accounts
    console.log('\n🔑 Fetching Page Access Token for Glamour\'s Touch Page...');
    const accountsRes = await fetch(`${GRAPH_BASE}/me/accounts?access_token=${USER_TOKEN}`);
    const accountsData = await accountsRes.json();

    let pageToken = null;
    if (accountsData.data && accountsData.data.length > 0) {
      const pageObj = accountsData.data.find(p => p.id === PAGE_ID);
      if (pageObj) pageToken = pageObj.access_token;
    }

    if (!pageToken) {
      console.log('⚠️ Page Token not found, using System User Token...');
      pageToken = USER_TOKEN;
    } else {
      console.log('✅ Page Access Token retrieved successfully!');
    }

    // 2. Post WORLD-CLASS MASTERPIECE PHOTO file buffer to Facebook Page (/{page_id}/photos)
    console.log('🚀 Publishing World-Class Masterpiece Commercial Photo Stream to Glamour\'s Touch Facebook Page...');
    
    const fileBuffer = fs.readFileSync(post.localImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const form = new FormData();
    form.append('access_token', pageToken);
    form.append('caption', fullCaption);
    form.append('source', blob, 'cosrx_snail_96_masterpiece.jpg');

    const photoRes = await fetch(`${GRAPH_BASE}/${PAGE_ID}/photos`, {
      method: 'POST',
      body: form
    });

    const photoData = await photoRes.json();
    console.log('📦 Meta API Photo Response:', JSON.stringify(photoData, null, 2));

    if (photoData.id) {
      console.log(`\n🎉 SUCCESS! CEO World-Class Masterpiece Sales Post Published Live on Facebook Page! Photo ID: ${photoData.id}`);
    } else {
      console.error('❌ Facebook Photo Post Failed:', photoData);
    }
  } catch (err) {
    console.error('❌ Execution Error:', err);
  }
}

runDailyCEOMarketAnalysis();
