import fetch from 'node-fetch';

/**
 * Meta WhatsApp Cloud API Webhook & AI Bot Endpoint for Glamour's Touch
 * Handles Webhook Verification (GET) and Incoming WhatsApp Messages (POST)
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'glamours_touch_whatsapp_verify_secret_2026';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1002146686323797';
const ACCESS_TOKEN = process.env.META_SYSTEM_USER_TOKEN;

export default async function handler(req, res) {
  // 1. Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ WhatsApp Webhook Verified Successfully!');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification token mismatch' });
      }
    }
    return res.status(400).json({ error: 'Missing hub parameters' });
  }

  // 2. Incoming WhatsApp Message Handling (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message) {
          const from = message.from; // Customer WhatsApp Number
          const msgText = (message.text?.body || '').trim().toLowerCase();

          console.log(`📩 Incoming WhatsApp Message from ${from}: "${msgText}"`);

          // Generate AI & Catalog Automated Response
          let replyText = "হ্যালো! 🌸 Glamour's Touch-এ আপনাকে স্বাগতম।\n১০০% অরিজিনাল কোরিয়ান কসমেটিকস দেখতে ভিসিট করুন: https://www.glamourstouch.com/";

          if (msgText.includes('price') || msgText.includes('দাম') || msgText.includes('কত')) {
            replyText = "🌸 Glamour's Touch-এ আমাদের সকল অরিজিনাল কোরিয়ান প্রোডাক্টের স্পেশাল দাম ও ডিসকাউন্ট জানতে ওয়েবাসইট দেখুন:\n👉 https://www.glamourstouch.com/shop";
          } else if (msgText.includes('tone up') || msgText.includes('toneup') || msgText.includes('ফর্সা') || msgText.includes('lotion') || msgText.includes('লোশন')) {
            replyText = "✨ সেরা ৩টি অরিজিনাল কোরিয়ান বডি টোন-আপ লোশন:\n1️⃣ Christian Dean Tone-up (৳৪৩০ অফার)\n2️⃣ DABO Speed Tone-Up (৳১,৪৫০)\n3️⃣ Vaseline Gluta-Hya (৳৮৫০)\n\nঅর্ডার করতে ভিসিট করুন: https://www.glamourstouch.com/shop?search=Tone-up";
          } else if (msgText.includes('glow') || msgText.includes('scan') || msgText.includes('ai')) {
            replyText = "✨ আমাদের ফ্রি AI Glow Predictor দিয়ে আপনার ত্বক স্ক্যান করে সমাধান পান:\n👉 https://www.glamourstouch.com/glow-predictor";
          } else if (msgText.includes('order') || msgText.includes('অর্ডার')) {
            replyText = "📦 অর্ডার করতে আপনার নাম, মোবাইল নম্বর ও অ্যাড্রেস লিখে মেসেজ দিন, অথবা ওয়েবাসইটে সরাসরি অর্ডার করুন:\n👉 https://www.glamourstouch.com/cart";
          }

          // Send Reply via Meta Cloud API
          if (ACCESS_TOKEN && PHONE_NUMBER_ID) {
            await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: from,
                type: 'text',
                text: { body: replyText },
              }),
            });
            console.log(`✅ Automated WhatsApp reply sent to ${from}`);
          }
        }
      }
      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err) {
      console.error('❌ WhatsApp Webhook Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
