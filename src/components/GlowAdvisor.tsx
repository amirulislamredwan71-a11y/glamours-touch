import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Msg { role: 'user' | 'model'; content: string; }

const GREETING =
  "আসসালামু আলাইকুম! 🌿 আমি Glamour's Touch-এর Glow Adviser। আপনার ত্বকের সমস্যা বা লক্ষ্য বলুন (ব্রণ, কালো দাগ, শুষ্কতা, গ্লো) — সেরা Korean রুটিন ও পণ্য বলে দিচ্ছি ✨";

const QUICK = ['কালো দাগ দূর করার রুটিন', 'ব্রণের জন্য কী ব্যবহার করব?', 'গ্লোয়িং স্কিন চাই'];

const GlowAdvisor: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [msgs, loading, open]);

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
      setMsgs((m) => [...m, { role: 'model', content: d.reply || 'দুঃখিত, একটু পরে আবার চেষ্টা করুন — অথবা WhatsApp-এ লিখুন 🙏' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'model', content: 'সংযোগে সমস্যা হলো — WhatsApp (01712-426871)-এ লিখুন 🙏' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Docked "Glow Adviser • Live" bar (prototype) ── */}
      {!open && (
        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed left-2 right-2 sm:left-auto sm:right-6 sm:w-[370px] bottom-[58px] sm:bottom-6 z-[90] flex items-center justify-between gap-2 rounded-full pl-2.5 pr-1.5 py-1.5 border border-gtgold/50 backdrop-blur-md"
          style={{ background: 'rgba(18,18,22,0.95)', boxShadow: '0 8px 25px rgba(0,0,0,0.7)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full gt-shiny flex items-center justify-center"><Headphones size={16} /></div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00e676] border-2 border-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-white">Glow Adviser</span>
                <span className="text-[9px] font-semibold text-[#00e676]">• Live</span>
              </div>
              <p className="text-[10px] text-white/55 leading-none mt-0.5 truncate">আপনার স্কিন ও প্রোডাক্ট নিয়ে প্রশ্ন করুন</p>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="bg-[#161d22] border-2 border-gtgold text-white hover:bg-gtgold hover:text-charcoal font-black text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg shrink-0 transition-all">
            <MessageCircle size={14} className="text-gtgold" /> Live Chat
          </button>
        </motion.div>
      )}

      {/* ── Chat panel (dark) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-[72px] sm:bottom-6 left-2 right-2 sm:left-auto sm:right-6 sm:w-[380px] z-[100] rounded-3xl shadow-2xl border border-gtgold/25 flex flex-col overflow-hidden gt-card"
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
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'gt-shiny rounded-br-sm' : 'bg-white/8 border border-white/10 text-white/85 rounded-bl-sm'}`}>
                    {m.content}
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
