import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const USER_TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const PAGE_ID = '1002146686323797'; // Glamour's Touch FB Page ID
const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

// Trending Market Products with EXACT 100% Authentic High-Res Product Photos
const VIRAL_SALES_POSTS = [
  {
    title: "🔥 কোরিয়ার ১নং ভাইরাল স্কিনকেয়ার সিক্রেট — Christian Dean Secret Tone-up Sun Cream!",
    offer: "আজকের স্পেশাল সুপার অফার দাম: মাত্র ৳৪৩০ (৪৮% ছাড়!)",
    content: "ত্বককে ক্ষতিকর UV রশ্মি থেকে রক্ষা করার সাথে সাথেই ত্বক পাবে ১ সেকেন্ডে ইনস্ট্যান্ট ন্যাচারাল গ্লো ও ফেয়ারনেস! কনে, স্টুডেন্ট বা কর্মজীবী নারী—সবার ডেইলি স্কিনকেয়ার রুটিনে এটা মাস্ট হ্যাভ।\n\n✨ ১০০% অরিজিনাল কোরিয়ান প্রোডাক্ট।\n🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ করুন)।",
    link: "https://www.glamourstouch.com/shop?search=Secret+Tone-up&ref=ceo_daily_photo_post",
    imageUrl: "https://www.glamourstouch.com/banners/christian_dean_secret_toneup_suncream_430.jpg",
    hashtags: "#GlamoursTouch #ChristianDean #KoreanSkincareBD #ToneUpCream #Sunscreen #AuthenticBeauty"
  },
  {
    title: "✨ ব্রণের গর্ত ও কালো দাগ দূর করতে কোরিয়ার টপ-রেটেড এসেন্স — Cosrx Snail Radiance Dual Essence!",
    offer: "আজকের সেরা সেলস প্রাইস: ৳২,৬৯০",
    content: "ত্বকের ড্যামেজ রিকভারি করে ত্বককে কাচের মতো মসৃণ ও গ্লাস-স্কিন টেক্সচার দিতে স্নেইল মিউসিনের জুড়ি নেই। নিয়মিত ব্যবহারে স্কিন ব্যারিয়ার শক্ত হয় ও বয়সের ছাপ দূর হয়।\n\n🛍️ ১০০% অরিজিনাল কোরিয়ান কসমেটিকস।\n📦 অর্ডার করতে ইনবক্সে মেসেজ দিন বা আমাদের ওয়েবসাইট থেকে অর্ডার করুন।",
    link: "https://www.glamourstouch.com/shop?search=Cosrx+Snail&ref=ceo_daily_photo_post",
    imageUrl: "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-ed0849b7-d064-4013-97bb-cb8f78bceb61.jpg",
    hashtags: "#CosrxSnailEssence #GlassSkin #KoreanSkincareBangladesh #GlamoursTouch"
  },
  {
    title: "🌸 ত্বকের মেছতা ও জেদি মেলাজমা দাগ দূর করুন — Medicube Kojic Acid Turmeric Vita Capsule Cream!",
    offer: "অফিসিয়াল ডিসকাউন্ট প্রাইস: ৳২,০০০",
    content: "কোরিয়ার ক্লিনিক্যালি পরীক্ষিত ট্যানেক্সামিক ও কোজিক এসিড ফর্মুলা। ত্বকের মেলানিন কমিয়ে মেছতা ও ব্রণের কালো ছোপ দাগ স্থায়ীভাবে হালকা করে ত্বক করে দাগহীন ফর্সা।\n\n⚡ সারাদেশে ক্যাশ অন ডেলিভারি দেওয়া হয়।",
    link: "https://www.glamourstouch.com/shop?search=Medicube+Capsule&ref=ceo_daily_photo_post",
    imageUrl: "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-ba33b4ab-3932-452c-af0c-7e1375c3db8b.jpg",
    hashtags: "#MedicubeTXA #MelasmaRemoval #DarkSpotTreatment #GlamoursTouchBD"
  }
];

async function runDailyCEOMarketAnalysis() {
  console.log('👑 [CEO AI Agent] Executing Live Market Analysis & High-Res Product Photo Auto-Posting...');

  // Pick today's post based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const post = VIRAL_SALES_POSTS[dayOfYear % VIRAL_SALES_POSTS.length];

  const fullCaption = `${post.title}\n\n💰 ${post.offer}\n\n${post.content}\n\n🛒 অরিজিনাল প্রোডাক্ট সরাসরি অর্ডার করুন:\n👉 ${post.link}\n\n${post.hashtags}`;

  console.log('\n📝 Today\'s Automated Photo Sales Post:\n', fullCaption);
  console.log('🖼️ Exact Product High-Res Image URL:', post.imageUrl);

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

    // 2. Post EXACT High-Res Product PHOTO with caption to Facebook Page (/{page_id}/photos)
    console.log('🚀 Publishing Exact High-Res Product Photo Post to Glamour\'s Touch Facebook Page...');
    const photoRes = await fetch(`${GRAPH_BASE}/${PAGE_ID}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: post.imageUrl,
        caption: fullCaption,
        access_token: pageToken
      })
    });

    const photoData = await photoRes.json();
    console.log('📦 Meta API Photo Response:', JSON.stringify(photoData, null, 2));

    if (photoData.id) {
      console.log(`\n🎉 SUCCESS! CEO Daily Exact Product Photo Sales Post Published Live on Facebook Page! Photo ID: ${photoData.id}`);
    } else {
      console.error('❌ Facebook Photo Post Failed:', photoData);
    }
  } catch (err) {
    console.error('❌ Execution Error:', err);
  }
}

runDailyCEOMarketAnalysis();
