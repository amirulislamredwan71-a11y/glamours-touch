import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const USER_TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const PAGE_ID = '1002146686323797'; // Glamour's Touch FB Page ID
const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

// Trending Market Products & Viral Sales Offer Copy Bank
const VIRAL_SALES_POSTS = [
  {
    title: "🔥 কোরিয়ার ১নং ভাইরাল স্কিনকেয়ার সিক্রেট — Christian Dean Secret Tone-up Sun Cream!",
    offer: "আজকের স্পেশাল সুপার অফার দাম: মাত্র ৳৪৩০ (৪৮% ছাড়!)",
    content: "ত্বককে ক্ষতিকর UV রশ্মি থেকে রক্ষা করার সাথে সাথেই ত্বক পাবে ১ সেকেন্ডে ইনস্ট্যান্ট ন্যাচারাল গ্লো ও ফেয়ারনেস! কনে, স্টুডেন্ট বা কর্মজীবী নারী—সবার ডেইলি স্কিনকেয়ার রুটিনে এটা মাস্ট হ্যাভ।\n\n✨ ১০০% অরিজিনাল কোরিয়ান প্রোডাক্ট।\n🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ করুন)।",
    link: "https://www.glamourstouch.com/shop?search=Secret+Tone-up&ref=ceo_daily_post",
    hashtags: "#GlamoursTouch #ChristianDean #KoreanSkincareBD #ToneUpCream #Sunscreen #AuthenticBeauty"
  },
  {
    title: "✨ ব্রণের গর্ত ও কালো দাগ দূর করতে কোরিয়ার টপ-রেটেড এসেন্স — Cosrx Snail 96 Essence!",
    offer: "আজকের সেরা সেলস প্রাইস: ৳১,৩৫০",
    content: "ত্বকের ড্যামেজ রিকভারি করে ত্বককে কাচের মতো মসৃণ ও গ্লাস-স্কিন টেক্সচার দিতে স্নেইল মিউসিনের জুড়ি নেই। নিয়মিত ব্যবহারে স্কিন ব্যারিয়ার শক্ত হয় ও বয়সের ছাপ দূর হয়।\n\n🛍️ ১০০% অরিজিনাল কোরিয়ান কসমেটিকস।\n📦 অর্ডার করতে ইনবক্সে মেসেজ দিন বা আমাদের ওয়েবসাইট থেকে অর্ডার করুন।",
    link: "https://www.glamourstouch.com/shop?search=Cosrx+Snail+96&ref=ceo_daily_post",
    hashtags: "#CosrxSnailEssence #GlassSkin #KoreanSkincareBangladesh #GlamoursTouch"
  },
  {
    title: "🌸 ত্বকের মেছতা ও জেদি মেলাজমা দাগ দূর করুন — Medicube TXA Capsule Cream!",
    offer: "অফিসিয়াল ডিসকাউন্ট প্রাইস: ৳১,৬৫0",
    content: "কোরিয়ার ক্লিনিক্যালি পরীক্ষিত ট্যানেক্সামিক এসিড ফর্মুলা। ত্বকের মেলানিন কমিয়ে মেছতা ও ব্রণের কালো ছোপ দাগ স্থায়ীভাবে হালকা করে ত্বক করে দাগহীন ফর্সা।\n\n⚡ সারাদেশে ক্যাশ অন ডেলিভারি দেওয়া হয়।",
    link: "https://www.glamourstouch.com/shop?search=Medicube+TXA&ref=ceo_daily_post",
    hashtags: "#MedicubeTXA #MelasmaRemoval #DarkSpotTreatment #GlamoursTouchBD"
  }
];

async function runDailyCEOMarketAnalysis() {
  console.log('👑 [CEO AI Agent] Executing Live Market Analysis & Automated Sales Posting...');

  // Pick today's post based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const post = VIRAL_SALES_POSTS[dayOfYear % VIRAL_SALES_POSTS.length];

  const fullMessage = `${post.title}\n\n💰 ${post.offer}\n\n${post.content}\n\n🛒 অরিজিনাল প্রোডাক্ট সরাসরি অর্ডার করুন:\n👉 ${post.link}\n\n${post.hashtags}`;

  console.log('\n📝 Today\'s Automated High-Converting Post:\n', fullMessage);

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
      console.log('⚠️ Page Token not found in me/accounts, falling back to System User Token...');
      pageToken = USER_TOKEN;
    } else {
      console.log('✅ Page Access Token retrieved successfully!');
    }

    // 2. Post to Facebook Page Feed
    console.log('🚀 Auto-posting to Glamour\'s Touch Facebook Page...');
    const res = await fetch(`${GRAPH_BASE}/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: fullMessage,
        access_token: pageToken
      })
    });

    const data = await res.json();
    console.log('📦 Meta API Response:', JSON.stringify(data, null, 2));

    if (data.id) {
      console.log(`\n🎉 SUCCESS! CEO Daily Sales Post Published Live on Facebook Page! Post ID: ${data.id}`);
    } else {
      console.error('❌ Facebook Post Failed:', data);
    }
  } catch (err) {
    console.error('❌ Execution Error:', err);
  }
}

runDailyCEOMarketAnalysis();
