import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const USER_TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const PAGE_ID = '1002146686323797'; // Glamour's Touch FB Page ID
const GRAPH_BASE = 'https://graph.facebook.com/v19.0';
const MEMORY_FILE_PATH = path.resolve('scripts/ceo-memory.json');

// Full 7-Day Rotating Catalog of Top Best Sellers for Meta Sales Campaign
const VIRAL_SALES_POSTS = [
  {
    id: "cosrx_snail_96",
    title: "✨ ব্রণের গর্ত ও কালচে দাগ দূর করতে কোরিয়ার বিশ্ববিখ্যাত গ্লাস-স্কিন সিক্রেট — COSRX Advanced Snail 96 Essence!",
    offer: "আজকের সিইও স্পেশাল প্রাইস: ৳১,৩৫০ (অরিজিনাল কোরিয়ান গ্যারান্টি 🇰🇷)",
    content: "ত্বকের ড্যামেজ রিকভারি করে ত্বককে কাচের মতো মসৃণ, সজীব ও গ্লাস-স্কিন টেক্সচার দিতে স্নেইল মিউসিনের জুড়ি নেই। এটি ত্বকের আর্দ্রতা ধরে রেখে বলিরেখা কমায় এবং স্কিন ব্যারিয়ার পুনর্গঠন করে।\n\n✨ ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার কসমেটিকস।\n🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে দেখে টাকা দিন)।",
    link: "https://www.glamourstouch.com/shop?search=Cosrx+Snail+96&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/cosrx_snail_96_masterpiece.jpg",
    hashtags: "#GlamoursTouch #CosrxSnail96 #GlassSkinKorea #KoreanSkincareBD #AuthenticBeauty"
  },
  {
    id: "christian_dean_toneup",
    title: "☀️ ইনস্ট্যান্ট ফেয়ারনেস ও রোদে পোড়া দাগ থেকে ১০০% সুরক্ষা — Christian Dean Secret Tone-Up Sun Cream!",
    offer: "আজকের ধামাকা অফার প্রাইস: ৳৪৩০ (আজকের জন্য প্রযোজ্য 🔥)",
    content: "সানস্ক্রিন প্লাস টোন-আপ ক্রিমের ডাবল অ্যাকশন! রোদের ক্ষতিকর রশ্মি থেকে ত্বককে বাঁচায় এবং ক্ষণে ক্ষণে মেকআপ ছাড়াই ত্বককে দেয় প্রাকৃতিক উজ্জ্বলতা। তৈলাক্ত ভাব ছাড়া দীর্ঘস্থায়ী গ্লো!\n\n✨ ১০০% অরিজিনাল সাউথ কোরিয়ান গ্যারান্টি।\n🚚 ক্যাশ অন ডেলিভারিতে হাতে পেয়ে চেক করে টাকা দিন।",
    link: "https://www.glamourstouch.com/shop?search=Christian+Dean&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/toneup_hero_banner.jpg",
    hashtags: "#GlamoursTouch #ChristianDean #ToneUpSunCream #SunscreenBD #KoreanBeauty"
  },
  {
    id: "dabo_black_snail_retinal",
    title: "🌙 বয়সের ছাপ ও মেছতার দাগ দূর করার কোরিয়ান মিরাকেল — DABO Black Snail Retinal A+ Solution!",
    offer: "সিইও ডিরেক্ট ডিসকাউন্ট প্রাইস: ৳১,১৪০ (স্টক সীমিত ⚡)",
    content: "ব্ল্যাক স্নেইল মিউসিন ও রেটিনল এ+ এর পাওয়ারফুল ফর্মুলা ত্বকের অ্যান্টি-এজিং, ফাইন লাইনস ও কালচে ছোপ ছোপ দাগ দূর করে ত্বককে করে তোলে তারুণ্যোজ্জ্বল ও টানটান।\n\n✨ ১০০% প্রিমিয়াম কোরিয়ান ইমপোর্ট।\n🚚 হোম ডেলিভারিতে পণ্য দেখে টাকা পরিশোধের সুযোগ।",
    link: "https://www.glamourstouch.com/shop?search=Dabo+Black+Snail&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/dabo_toneup_care.jpg",
    hashtags: "#GlamoursTouch #DaboRetinal #BlackSnail #AntiAgingBD #KoreanSkincare"
  },
  {
    id: "beauty_of_joseon_sunscreen",
    title: "🌾 গ্লাস-স্কিন লাভারদের ১ নম্বর পছন্দ — Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+!",
    offer: "আজকের স্পেশাল প্রাইস: ৳১,১৯০ (অরিজিনাল কোরিয়ান গ্যারান্টি 🌾)",
    content: "হালকা রাইস এক্সট্রাক্ট ও প্রোবায়োটিকস সমৃদ্ধ সানস্ক্রিন যা ত্বকে কোনো হোয়াইট ক্যাস্ট ছাড়া দেবে ডিপ হাইড্রেশন ও সূর্যের UVA/UVB থেকে সর্বোচ্চ সুরক্ষা।\n\n✨ ১০০% অরিজিনাল কোরিয়ান কসমেটিকস।\n🚚 সারা দেশে ক্যাশ অন ডেলিভারি।",
    link: "https://www.glamourstouch.com/shop?search=Beauty+of+Joseon&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/cat_sunscreen.jpg",
    hashtags: "#GlamoursTouch #BeautyOfJoseon #RiceSunscreen #GlassSkinBD #KoreanBeauty"
  },
  {
    id: "anua_niacinamide_serum",
    title: "💎 স্কিনের একনে স্পট ও পোরস ছোট করার ভাইরাল ফর্মুলা — ANUA Niacinamide 10% + TXA 4% Serum!",
    offer: "সিইও স্পেশাল অফার: ৳২,১৫০ (অরিজিনাল গ্যারান্টি 💎)",
    content: "১০% নিয়াসিনামাইড ও ৪% ট্রানেক্সামিক অ্যাসিডের জাদুকরী মিশ্রণ ত্বকের হাইপারপিগমেন্টেশন, একনে স্পট এবং আনইভেন স্কিন টোন একদম স্মুথ করে গ্লাস-স্কিন শাইন এনে দেয়।\n\n✨ ১০০% ডিরেক্ট সাউথ কোরিয়ান ইমপোর্ট।\n🚚 হোম ডেলিভারি ক্যাশ অন ডেলিভারিতে।",
    link: "https://www.glamourstouch.com/shop?search=Anua+Niacinamide&ref=ceo_masterpiece_post",
    localImagePath: "public/banners/cat_serum_treatment.jpg",
    hashtags: "#GlamoursTouch #AnuaNiacinamide #SpotCorrection #KoreanSerum #GlassSkin"
  }
];

// Helper to load persistent CEO Memory
function loadCEOMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      const data = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('⚠️ Could not read CEO Memory file, initializing fresh memory...');
  }
  return { lastPostIndex: -1, postHistory: [] };
}

// Helper to save persistent CEO Memory
function saveCEOMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(memory, null, 2), 'utf8');
    console.log('💾 CEO Persistent Memory Updated & Saved Successfully!');
  } catch (e) {
    console.error('❌ Failed to save CEO Memory:', e);
  }
}

async function runDailyCEOMarketAnalysis() {
  console.log('🧠 [CEO AI Agent] Accessing Persistent Memory & Executing Live Market Rotation...');

  const memory = loadCEOMemory();
  const nextIndex = (memory.lastPostIndex + 1) % VIRAL_SALES_POSTS.length;
  const post = VIRAL_SALES_POSTS[nextIndex];

  console.log(`\n📅 Previous Post Index: ${memory.lastPostIndex} ➔ Next Rotating Product Index: ${nextIndex} (${post.id})`);

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
    console.log(`🚀 Publishing [${post.id}] Commercial Photo Stream to Glamour's Touch Facebook Page...`);
    
    const fileBuffer = fs.readFileSync(post.localImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const form = new FormData();
    form.append('access_token', pageToken);
    form.append('caption', fullCaption);
    form.append('source', blob, `${post.id}.jpg`);

    const photoRes = await fetch(`${GRAPH_BASE}/${PAGE_ID}/photos`, {
      method: 'POST',
      body: form
    });

    const photoData = await photoRes.json();
    console.log('📦 Meta API Photo Response:', JSON.stringify(photoData, null, 2));

    if (photoData.id) {
      console.log(`\n🎉 SUCCESS! CEO Masterpiece Sales Post Published Live on Facebook Page! Photo ID: ${photoData.id}`);
      
      // Update & Save CEO Memory Log
      memory.lastPostIndex = nextIndex;
      memory.postHistory.push({
        timestamp: new Date().toISOString(),
        productId: post.id,
        title: post.title,
        photoId: photoData.id,
        postId: photoData.post_id || `${PAGE_ID}_${photoData.id}`
      });
      saveCEOMemory(memory);
    } else {
      console.error('❌ Facebook Photo Post Failed:', photoData);
    }
  } catch (err) {
    console.error('❌ Execution Error:', err);
  }
}

runDailyCEOMarketAnalysis();
