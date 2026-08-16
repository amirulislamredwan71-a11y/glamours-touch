import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

import { processGTBotQuery } from '../lib/gt_bot_engine';

interface Msg { role: 'user' | 'model'; content: string; }

const GREETING =
  "আসসালামু আলাইকুম! 🌿 আমি Glamour's Touch-এর 24/7 AI Seller Assistant (GT BOT)। আপনার ত্বকের সমস্যা বা পছন্দের পণ্য সম্পর্কে বলুন — সেরা কোরিয়ান রুটিন, অফার প্রাইজ ও সরাসরি অর্ডার সুবিধা একসাথে পেয়ে যাবেন ✨";

const QUICK = ['📦 অর্ডার ট্র্যাকিং', '🔥 দামাকা অফার', '✨ গ্লাস স্কিন সিক্রেট', '💬 WhatsApp-এ কথা বলুন'];

const GlowAdvisor: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [msgs, loading, open]);

  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-gtgold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-gtgold font-bold underline hover:text-white transition-colors">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  const sendText = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...msgs, { role: 'user', content: t }];
    setMsgs(next); setInput(''); setLoading(true);

    if (t.includes('WhatsApp') || t.includes('হোয়াটসঅ্যাপ')) {
      window.open('https://wa.me/8801712426871', '_blank');
    }

    try {
      const botRes = await processGTBotQuery(t);
      setMsgs((m) => [...m, { role: 'model', content: botRes.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: 'model', content: "গ্ল্যামারস টাচে পাচ্ছেন ৫৬৩+ ১০০% অরিজিনাল কোরিয়ান কসমেটিকস! যেকোনো প্রোডাক্টের নাম বা স্কিন সমস্যা লিখে জানান ✨" }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Floating Compact "GT BOT AI" button (Left Aligned) ── */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed left-3.5 bottom-[88px] sm:bottom-6 z-[90] bg-[#12171c]/95 border-2 border-gtgold/90 text-white hover:bg-gtgold hover:text-black font-extrabold text-[11px] px-3.5 py-2 rounded-full flex items-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.85)] hover:scale-105 transition-all group backdrop-blur-md"
          style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.85)' }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e676]"></span>
          </span>
          <Sparkles size={15} className="text-gtgold group-hover:text-black transition-colors animate-pulse" />
          <span className="font-extrabold tracking-wide uppercase">GT BOT AI</span>
        </motion.button>
      )}

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-[96px] sm:bottom-6 left-2 right-2 sm:right-auto sm:left-6 sm:w-[400px] z-[100] rounded-3xl shadow-2xl border border-gtgold/30 flex flex-col overflow-hidden gt-card backdrop-blur-xl"
            style={{ maxHeight: '75vh' }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-gtgold/20" style={{ background: '#141418' }}>
              <div className="flex items-center gap-2.5">
                <span className="gt-cat-ring w-9 h-9 shrink-0 block">
                  <span className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#141418' }}><Headphones size={16} className="text-gtgold" /></span>
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-sm leading-none text-white tracking-wide">GT BOT AI</p>
                    <span className="bg-gtgold/20 text-gtgold text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-gtgold/40">BD #1 SELLER</span>
                  </div>
                  <p className="text-[10px] font-semibold mt-1 text-[#00e676]">Online 24/7 • Instant AI Sales Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="close" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"><X size={16} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3" style={{ minHeight: 260, background: '#101014' }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'gt-shiny text-black font-semibold rounded-br-sm shadow-md' : 'bg-white/8 border border-white/10 text-white/90 rounded-bl-sm shadow-sm'}`}>
                    {formatMessageText(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gtgold" />
                    <span className="text-xs text-gray-400 font-semibold">GT BOT চিন্তা করছে...</span>
                  </div>
                </div>
              )}
              {msgs.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => sendText(q)} className="text-[11px] bg-gtgold/10 border border-gtgold/40 text-gtgold px-3 py-1.5 rounded-full hover:bg-gtgold hover:text-black font-bold transition-all shadow-sm">
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
                placeholder="প্রোডাক্টের নাম, ব্রণ বা অর্ডার #57127baa লিখুন…"
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
