import catalogData from '../data/catalog_knowledge.json';
import { supabase } from './supabase';

export interface GTBotResponse {
  reply: string;
  recommendedProducts?: any[];
  orderInfo?: any;
  action?: 'track_order' | 'quick_order' | 'whatsapp_connect';
}

/**
 * GT BOT — Bangladesh's #1 AI E-Commerce Sales Engine for Glamour's Touch
 */
export async function processGTBotQuery(userQuery: string): Promise<GTBotResponse> {
  const q = userQuery.trim().toLowerCase();

  // 1. Check if user is asking to track an order (e.g. "order #57127baa", "57127baa", "আমার অর্ডার কোথায়")
  const orderIdMatch = q.match(/(?:order|অর্ডার|id|#)?\s*#?([a-f0-9]{8})/i);
  if (orderIdMatch || q.includes('অর্ডার ট্র্যাকিং') || q.includes('কোথায়') || q.includes('track')) {
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    if (orderId) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .ilike('id', `%${orderId}%`)
          .limit(1);

        if (data && data.length > 0) {
          const order = data[0];
          const displayId = order.id.slice(-8).toUpperCase();
          let statusText = 'অপেক্ষেমাণ (Pending)';
          if (order.status === 'Processing') statusText = 'প্রসেসিং হচ্ছে (Processing)';
          if (order.status === 'Shipped') statusText = 'কুরিয়ারে হস্তান্তর করা হয়েছে (Shipped 🚚)';
          if (order.status === 'Delivered') statusText = 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered 🎉)';

          return {
            reply: `📦 **অর্ডার ট্র্যাকিং তথ্য (#${displayId})**:\n\n` +
                   `• **কাস্টমার নাম:** ${order.shipping_address?.fullName || 'N/A'}\n` +
                   `• **বর্তমান স্ট্যাটাস:** **${statusText}**\n` +
                   `• **সর্বমোট মূল্য:** ৳${order.total?.toLocaleString() || '0'}\n` +
                   `• **পেমেন্ট টাইপ:** ক্যাশ অন ডেলিভারি (COD)\n\n` +
                   `🚚 বিস্তারিত ট্র্যাকিং লিংক: [অর্ডার ট্র্যাক করুন](https://glamourstouch.com/track-order?id=${displayId})`,
            orderInfo: order,
            action: 'track_order'
          };
        }
      } catch (err) {
        console.error('Error fetching order in GT Bot:', err);
      }
    }
  }

  // 2. Skin Problem & Specific Advisory Categorization (Priority matching for skin concerns)
  if (q.includes('ব্রণ') || q.includes('ব্রন') || q.includes('acne') || q.includes('pimple') || q.includes('বিচি')) {
    return {
      reply: `✨ **ব্রণ ও একনে সমস্যা সমাধানের জন্য সেরা ২ কোরিয়ান প্রোডাক্ট রুটিন:**\n\n` +
             `১. **SKIN1004 Madagascar Centella Ampoule** (৳১,৭৫০)\n` +
             `   • ত্বকের অতিরিক্ত তেল ও ব্রণের ব্যাকটেরিয়া দূর করে লালচে ভাব কমায়।\n\n` +
             `২. **COSRX Salicylic Acid Daily Gentle Cleansing Foam** (৳১,১৫০)\n` +
             `   • পোরস গভীর থেকে পরিষ্কার করে নতুন ব্রণ উঠা বন্ধ করে।\n\n` +
             `💡 **পরামর্শ:** প্রতিদিন সকালে ও রাতে এই রুটিন ফলো করুন। অর্ডারে কল/হোয়াটসঅ্যাপ: 01712-426871 🛍️`
    };
  }

  if (q.includes('দাগ') || q.includes('মেছতা') || q.includes('মেশতা') || q.includes('spot') || q.includes('dark') || q.includes('pigmentation')) {
    return {
      reply: `🌟 **কালো দাগ ও মেছতা দূর করার জন্য সেরা কোরিয়ান গ্লোয়িং রুটিন:**\n\n` +
             `১. **AXIS-Y Dark Spot Correcting Glow Serum** (৳১,৬০০ — ২৪% ছাড়!)\n` +
             `   • ৫% নিয়াসিনামাইড যুক্ত, যা মেছতা ও ব্রণের কালো দাগ ২ সপ্তাহে হালকা করে।\n\n` +
             `২. **Anua Niacinamide 10% + TXA 4% Serum** (৳১,৯৫০)\n` +
             `   • মেলানিন তৈরি প্রতিরোধ করে ত্বককে ফর্সা ও কাঁচের মতো উজ্জ্বল করে।\n\n` +
             `🛍️ অর্ডারে কল/হোয়াটসঅ্যাপ: 01712-426871 ✨`
    };
  }

  if (q.includes('সানস্ক্রিন') || q.includes('sun') || q.includes('sunscreen') || q.includes('রোদে')) {
    return {
      reply: `☀️ **ত্বক কালো হওয়া ও রোদে পোড়া থেকে বাঁচতে সেরা কোরিয়ান সানস্ক্রিন:**\n\n` +
             `১. **Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+** (৳১,৬০০ — ২৮% ছাড়!)\n` +
             `   • বিশ্বসেরা নো-হোয়াইটকাস্ট লাইটওয়েট ময়েশ্চারাইজিং সানস্ক্রিন।\n\n` +
             `২. **SKIN1004 Hyalu-Cica Water-Fit Sun Serum SPF50+** (৳১,৭৫০)\n` +
             `   • হাইড্রা-গ্লো ফিনিশ দেয়, তৈলাক্ত ও সংবেদনশীল ত্বকের জন্য বেস্ট।\n\n` +
             `💡 রোদে বের হওয়ার ১৫ মিনিট আগে ব্যবহার করুন।`
    };
  }

  if (q.includes('গ্লো') || q.includes('glow') || q.includes('উজ্জ্বল') || q.includes('glass skin')) {
    return {
      reply: `✨ **কোরিয়ান গ্লাস স্কিন (Glass Skin Routine) সিক্রেট রুটিন:**\n\n` +
             `১. **Anua Heartleaf 77% Soothing Toner** (৳১,৯৫০)\n` +
             `   • ত্বকের পিএইচ লেভেল ঠিক রাখে ও হাইড্রেটেড গ্লো বজায় রাখে।\n\n` +
             `২. **COSRX Advanced Snail 96 Mucin Power Essence** (৳১,৮৫০)\n` +
             `   • স্কিন ব্যারিয়ার রিপেয়ার করে প্রাকৃতিক গ্লাস গ্লো নিয়ে আসে।\n\n` +
             `🛍️ সম্পূর্ণ কম্বো প্যাকটি অর্ডার করতে হোয়াটসঅ্যাপে নক দিন: **01712-426871** 💖`
    };
  }

  if (q.includes('অর্ডার') || q.includes('order') || q.includes('কিনি') || q.includes('কিনব') || q.includes('কিবাবে')) {
    return {
      reply: `🛍️ **গ্ল্যামারস টাচে অর্ডার করা অত্যন্ত সহজ!**\n\n` +
             `১. পছন্দের প্রোডাক্টের পাশে **'BUY NOW'** বা **'ADD TO CART'** চাপুন।\n` +
             `২. আপনার নাম, মোবাইল নাম্বার ও ডেলিভারি ঠিকানা দিন।\n` +
             `৩. **ক্যাশ অন ডেলিভারিতে (COD)** অর্ডার কনফার্ম করুন!\n\n` +
             `💬 অথবা সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপে অর্ডার করুন: [WhatsApp-এ চ্যাট করুন](https://wa.me/8801712426871)`
    };
  }

  // 3. Catalog Product Matching Search
  const words = q.split(/\s+/).filter(w => w.length > 1);
  const matchedProducts = (catalogData as any[]).filter(p => {
    const pName = (p.name || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    return words.some(w => pName.includes(w) || pBrand.includes(w) || pCat.includes(w));
  }).slice(0, 3);

  if (matchedProducts.length > 0) {
    let reply = `✨ **গ্ল্যামারস টাচের অরিজিনাল কোরিয়ান কসমেটিকস ও লাইভ অফার প্রাইজ:**\n\n`;
    matchedProducts.forEach((p, idx) => {
      const disc = p.market_price > p.price ? Math.round(((p.market_price - p.price) / p.market_price) * 100) : 0;
      reply += `${idx + 1}. **${p.name.trim()}**\n`;
      reply += `   • **ব্র্যান্ড:** ${p.brand ? p.brand.trim() : 'Korean Authentic'}\n`;
      reply += `   • **স্পেশাল অফার:** **৳${p.price.toLocaleString()}** ${disc > 0 ? `*(বাজার মূল্য: ৳${p.market_price.toLocaleString()} — ${disc}% ছাড়!)*` : ''}\n`;
      reply += `   • **কেন নিবেন:** ১০০% অরিজিনাল সাউথ কোরিয়ান ফরম্যুলা, যা ত্বকে কোনো সাইড ইফেক্ট ছাড়াই দ্রুত দৃশ্যমান গ্লো প্রদান করে।\n\n`;
    });
    reply += `🛍️ **সরাসরি কিনতে চান?** নিচে 'ADD TO CART' চাপুন অথবা হোয়াটসঅ্যাপে অর্ডার করুন: **01712-426871** ✨`;

    return {
      reply,
      recommendedProducts: matchedProducts,
      action: 'quick_order'
    };
  }

  // Fallback response with catalog highlights
  return {
    reply: `গ্ল্যামারস টাচে পাচ্ছেন ৫৬৩+ ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার প্রোডাক্ট! যেকোনো প্রোডাক্টের নাম (যেমন: Axis-Y, Beauty of Joseon, COSRX, Anua, Medicube, Dabo, Centella) বা স্কিন সমস্যা লিখে জানান — সাথে সাথে দাম (৳) ও উপকারিতা পেয়ে যাবেন 🌿`
  };
}
