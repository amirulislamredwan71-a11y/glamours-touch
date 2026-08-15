import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Msg { role: 'user' | 'model'; content: string; }

const GREETING =
  "আসসালামু আলাইকুম! 🌿 আমি Glamour's Touch-এর Glow Adviser। আপনার ত্বকের সমস্যা বা লক্ষ্য বলুন (ব্রণ, কালো দাগ, শুষ্কতা, গ্লো) — সেরা Korean রুটিন ও পণ্য বলে দিচ্ছি ✨";

const QUICK = ['কালো দাগ দূর করার রুটিন', 'ব্রণের জন্য কী ব্যবহার করব?', 'গ্লোয়িং স্কিন চাই'];

import catalogData from '../data/catalog_knowledge.json';

const searchCatalogProducts = (query: string): any[] => {
  if (!catalogData || !catalogData.length) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  return (catalogData as any[]).filter(p => {
    const pName = p.name.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    const pDesc = (p.desc || '').toLowerCase();
    return words.some(w => pName.includes(w) || pBrand.includes(w) || pDesc.includes(w));
  }).slice(0, 3);
};

const GlowAdvisor: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [msgs, loading, open]);

  const formatMessageText = (text: string) => {
    // Clean markdown asterisks for beautiful rendering
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-gtgold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const getSmartFallback = (query: string): string => {
    const matches = searchCatalogProducts(query);
    if (matches.length > 0) {
      let resText = `গ্ল্যামারস টাচের ১০০% অরিজিনাল কোরিয়ান প্রোডাক্ট ও উপকারিতা:\n\n`;
      matches.forEach(p => {
        const disc = Math.round(((p.market_price - p.price) / p.market_price) * 100);
        resText += `🌟 **${p.name}** (${p.brand})\n`;
        resText += `💰 **অফার প্রাইজ:** ৳${p.price} (বাজার মূল্য: ৳${p.market_price} — ${disc}% ছাড়!)\n`;
        resText += `✨ **উপকারিতা:** ${p.desc || '১০০% অরিজিনাল কোরিয়ান ফরম্যুলা, যা ত্বকে কোনো সাইড ইফেক্ট ছাড়াই দ্রুত দৃশ্যমান গ্লো ও স্কিন ব্যারিয়ার রিপেয়ার করে।'}\n`;
        resText += `🧴 **ব্যবহারের নিয়ম:** প্রতিদিন সকালে ও রাতে মুখ ধুয়ে ব্যবহার করুন।\n\n`;
      });
      resText += `🛍️ সরাসরি অর্ডার করতে ওয়েবসাইটের শপ মেনু ভিজিট করুন অথবা হোয়াটসঅ্যাপ করুন: 01712-426871 ✨`;
      return resText;
    }

    const q = query.toLowerCase();
    if (q.includes('price') || q.includes('দাম') || q.includes('টাকা') || q.includes('কত') || q.includes('parlana') || q.includes('bolte') || q.includes('lav ki') || q.includes('লাভ কি')) {
      return 'আমাদের জনপ্রিয় অরিজিনাল কোরিয়ান প্রোডাক্টের লাইভ অফার প্রাইস:\n• **AXIS-Y Dark Spot Glow Serum**: ৳১,৬০০ (নিয়মিত ৳২,১১০ — ২৪% অফ)\n• **Beauty of Joseon Relief Sun**: ৳১,৬০০ (নিয়মিত ৳২,২২০ — ২৮% অফ)\n• **COSRX Snail Mucin Essence**: ৳১,৮৫০\n• **SKIN1004 Centella Ampoule**: ৳১,৭৫০\n• **Anua Heartleaf Toner**: ৳১,৯৫০\n• **Dabo Cica Cleanser**: ৳৯৬০\n\nযে কোনো প্রোডাক্ট অর্ডারের জন্য ওয়েবসাইটের শপ মেনু ভিজিট করুন অথবা হোয়াটসঅ্যাপে চ্যাট করুন: 01712-426871 🛍️✨';
    }
    if (q.includes('ব্রণ') || q.includes('acne') || q.includes('pimple') || q.includes('বিচি')) {
      return 'ব্রণ দূর করতে **SKIN1004 Madagascar Centella Ampoule** (৳১,৭৫০) এবং **COSRX Salicylic Acid Cleanser** অত্যন্ত কার্যকরী! এগুলো ব্যাকটেরিয়া দূর করে জ্বালা-পোড়া কমায় ✨';
    }
    if (q.includes('দাগ') || q.includes('মেছতা') || q.includes('spot') || q.includes('dark') || q.includes('pigmentation')) {
      return 'কালো দাগ ও মেছতা হালকা করতে **AXIS-Y Dark Spot Correcting Glow Serum** (৳১,৬০০) এবং **Anua Niacinamide Serum** সেরা! নিয়মিত ব্যবহারে ত্বক দাগহীন ও উজ্জ্বল হয় 🌸';
    }
    if (q.includes('সানস্ক্রিন') || q.includes('sun') || q.includes('sunscreen') || q.includes('রোদে')) {
      return 'সান প্রোটেশনের জন্য **Beauty of Joseon Relief Sun** (৳১,৬০০) এবং **SKIN1004 Sun Serum** বেস্ট। এগুলো হালকা এবং ত্বকে কোনো হোয়াইট কাস্ট ফেলে না ☀️';
    }
    if (q.includes('শুষ্ক') || q.includes('dry') || q.includes('খসখসে') || q.includes('ময়েশ্চারাইজার')) {
      return 'শুষ্ক ত্বকে ইনস্ট্যান্ট ময়েশ্চার লক করতে **COSRX Advanced Snail Mucin Essence** (৳১,৮৫০) এবং **Beauty of Joseon Dynasty Cream** দারুণ কার্যকর 💧';
    }
    if (q.includes('গ্লো') || q.includes('glow') || q.includes('উজ্জ্বল') || q.includes('glass skin')) {
      return 'গ্লাস গ্লো পেতে **Anua Heartleaf 77% Soothing Toner** (৳১,৯৫০) এবং **Medicube PDRN Pink Peptide Serum** (৳১,৯৫০) ব্যবহার করুন! ✨';
    }
    return "গ্ল্যামারস টাচে পাচ্ছেন ৫৬৩+ ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার প্রোডাক্ট! যেকোনো প্রোডাক্টের নাম বা স্কিন সমস্যা লিখে জানান (যেমন: Axis-Y, Beauty of Joseon, COSRX, Anua, Medicube, Dabo, Centella), সাথে সাথে দাম (৳) ও উপকারিতা পেয়ে যাবেন 🌿";
  };

  const sendText = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...msgs, { role: 'user', content: t }];
    setMsgs(next); setInput(''); setLoading(true);
    try {
      const r = await fetch('/api/advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const d = await r.json();
      setMsgs((m) => [...m, { role: 'model', content: d.reply || getSmartFallback(t) }]);
    } catch {
      setMsgs((m) => [...m, { role: 'model', content: getSmartFallback(t) }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Floating Compact "Live Chat" button (Left Aligned for Ergonomic Thumb Scrolling) ── */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed left-4 bottom-[68px] sm:bottom-6 z-[90] bg-[#161d22] border-2 border-gtgold text-white hover:bg-gtgold hover:text-black font-black text-xs px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 transition-all group backdrop-blur-md"
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.85)' }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e676]"></span>
          </span>
          <MessageCircle size={15} className="text-gtgold group-hover:text-black transition-colors" />
          <span>Live Chat</span>
        </motion.button>
      )}

      {/* ── Chat panel (dark) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-[76px] sm:bottom-6 left-2 right-2 sm:right-auto sm:left-6 sm:w-[380px] z-[100] rounded-3xl shadow-2xl border border-gtgold/25 flex flex-col overflow-hidden gt-card"
            style={{ maxHeight: '72vh' }}
          >
            {/* Header — dark with gold-ring avatar (chatbox model) */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gtgold/20" style={{ background: '#141418' }}>
              <div className="flex items-center gap-2.5">
                <span className="gt-cat-ring w-9 h-9 shrink-0 block">
                  <span className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#141418' }}><Headphones size={16} className="text-gtgold" /></span>
                </span>
                <div>
                  <p className="font-bold text-sm leading-none text-white">Glow Adviser AI</p>
                  <p className="text-[10px] font-semibold mt-1 text-[#00e676]">Online • Instant Reply</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="close" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"><X size={16} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ minHeight: 240, background: '#101014' }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'gt-shiny text-black font-semibold rounded-br-sm' : 'bg-white/8 border border-white/10 text-white/90 rounded-bl-sm'}`}>
                    {formatMessageText(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/10 px-3 py-2 rounded-2xl"><Loader2 size={16} className="animate-spin text-gtgold" /></div>
                </div>
              )}
              {msgs.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => sendText(q)} className="text-[11px] bg-white/5 border border-gtgold/30 text-gtgoldsoft px-2.5 py-1.5 rounded-full hover:bg-gtgold/10 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-2.5 border-t border-white/10 flex items-center gap-2" style={{ background: '#141418' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText(input)}
                placeholder="আপনার স্কিন টাইপ লিখুন (যেমন: ওয়েলি, ড্রায়)…"
                className="flex-1 bg-white/8 text-white placeholder:text-white/40 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gtgold/40 border border-white/10"
              />
              <button onClick={() => sendText(input)} disabled={loading || !input.trim()} className="gt-shiny p-2.5 rounded-full disabled:opacity-40 hover:brightness-105 transition-all" aria-label="send">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlowAdvisor;
