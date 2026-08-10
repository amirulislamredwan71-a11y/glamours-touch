import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';

interface Msg { role: 'user' | 'model'; content: string; }

const GREETING =
  "আসসালামু আলাইকুম! 🌿 আমি Glamour's Touch-এর Glow Advisor। আপনার ত্বকের সমস্যা বা লক্ষ্য বলুন (ব্রণ, কালো দাগ, শুষ্কতা, গ্লো) — সেরা Korean রুটিন ও পণ্য বলে দিচ্ছি ✨";

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
      {/* Launcher */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 sm:bottom-6 left-4 z-[99] flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-gold/30 hover:scale-105 transition-all duration-300 group"
          title="AI Glow Advisor"
        >
          <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-20 group-hover:opacity-0" />
          <Sparkles size={20} className="flex-shrink-0" />
          <span className="text-sm font-bold tracking-wide hidden sm:inline">Glow Advisor</span>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-6 left-2 right-2 sm:left-4 sm:right-auto sm:w-[380px] z-[100] bg-white rounded-3xl shadow-2xl border border-gold/20 flex flex-col overflow-hidden"
            style={{ maxHeight: '72vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold to-amber-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Sparkles size={18} /></div>
                <div>
                  <p className="font-bold text-sm leading-none">Glow Advisor</p>
                  <p className="text-[10px] opacity-90 mt-0.5">AI Korean স্কিনকেয়ার বিশেষজ্ঞ</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="close"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50" style={{ minHeight: 240 }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-gold text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded-2xl"><Loader2 size={16} className="animate-spin text-gold" /></div>
                </div>
              )}
              {msgs.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => sendText(q)} className="text-[11px] bg-white border border-gold/30 text-gold px-2.5 py-1.5 rounded-full hover:bg-gold/10 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-2.5 border-t border-gray-100 bg-white flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText(input)}
                placeholder="আপনার ত্বকের সমস্যা লিখুন..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <button onClick={() => sendText(input)} disabled={loading || !input.trim()} className="bg-gold text-white p-2.5 rounded-full disabled:opacity-40 hover:brightness-110 transition-all" aria-label="send">
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
