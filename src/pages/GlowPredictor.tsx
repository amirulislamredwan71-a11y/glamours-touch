import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Camera, Upload, RotateCcw, Loader2, Share2, Check, X, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

interface P { id: string; name: string; brand: string | null; price: number; image: string; category?: string; description?: string; isFeatured?: boolean; }

/** Only face-applicable skincare categories — a shampoo/body-spray can't be "tried on" a face. */
const FACE_CATS = [
  'Moisturizer & Cream', 'Serum & Essence', 'Cleanser', 'Skincare', 'Sunscreen',
  'Toner', 'Masks & Exfoliators', 'Face Care', 'Eye Care', 'Serum & Treatment',
  'D A B O All In One Care', 'D A B O One In All Care', 'Medicube Skin Care', 'Makeup & Lip',
];

/** Resize a dataURL to a max dimension → { b64 (no prefix), mime } to keep the API payload light. */
function resizeImage(dataUrl: string, max = 820): Promise<{ b64: string; mime: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > max || height > max) {
        if (width > height) { height = Math.round((height * max) / width); width = max; }
        else { width = Math.round((width * max) / height); height = max; }
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const out = c.toDataURL('image/jpeg', 0.9);
      resolve({ b64: out.replace(/^data:[^;]+;base64,/, ''), mime: 'image/jpeg' });
    };
    img.src = dataUrl;
  });
}

const GlowPredictor: React.FC = () => {
  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const [photo, setPhoto] = useState<string | null>(null);
  const [products, setProducts] = useState<P[]>([]);
  const [selected, setSelected] = useState<P | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);
  const [cat, setCat] = useState<string>('⭐');
  const [analysis, setAnalysis] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const location = useLocation();
  const pid = useMemo(() => new URLSearchParams(location.search).get('product'), [location.search]);

  // Load only face-applicable skincare products, featured first
  useEffect(() => {
    supabase.from('products')
      .select('id,name,brand,price,image,category,description,isFeatured')
      .in('category', FACE_CATS)
      .order('isFeatured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(800)
      .then(({ data }) => { if (data) setProducts(data as P[]); });
  }, []);

  // Deep-link: a product card sent us here → preselect that product + its category
  useEffect(() => {
    if (!pid) return;
    supabase.from('products')
      .select('id,name,brand,price,image,category,description')
      .eq('id', pid).maybeSingle()
      .then(({ data }) => { if (data) { setSelected(data as P); setCat((data as P).category || '⭐'); } });
  }, [pid]);

  const cats = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products],
  );
  const shown = useMemo(() => {
    if (cat === '⭐') { const f = products.filter((p) => p.isFeatured); return (f.length ? f : products).slice(0, 30); }
    return products.filter((p) => p.category === cat);
  }, [products, cat]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode('idle');
  };
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1080 } } });
      streamRef.current = s;
      setMode('camera');
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } }, 60);
    } catch {
      setError('ক্যামেরা চালু করা গেল না — অনুমতি দিন বা "ছবি আপলোড" ব্যবহার করুন।');
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.92));
    setResult(null);
    stopCamera();
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8_000_000) { setError('ছবিটি খুব বড় — ৮MB-এর কম দিন।'); return; }
    const rd = new FileReader();
    rd.onload = () => { setPhoto(rd.result as string); setResult(null); setError(''); };
    rd.readAsDataURL(f);
  };

  const predict = async () => {
    if (!photo || !selected) return;
    setLoading(true); setError(''); setResult(null); setAnalysis(null);
    const productName = `${selected.name}${selected.brand ? ` (${selected.brand})` : ''}`;
    const effect = (selected.description || '').replace(/<[^>]*>/g, '').slice(0, 240);
    // AI ingredient/metric analysis in parallel (doesn't block the image)
    fetch('/api/glow-analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, effect, days: 30 }),
    }).then((r) => r.json()).then((a) => { if (a && a.metrics) setAnalysis(a); }).catch(() => {});
    try {
      const { b64, mime } = await resizeImage(photo, 820);
      const r = await fetch('/api/tryon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64, mimeType: mime,
          productName,
          effect,
          days: 28,
        }),
      });
      const d = await r.json();
      if (d.image) setResult(d.image);
      else setError(d.error === 'GEMINI_API_KEY not configured on the server' ? 'AI সেটআপ হচ্ছে — একটু পরে চেষ্টা করুন।' : (d.detail || 'তৈরি করা গেল না, আবার চেষ্টা করুন।'));
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally { setLoading(false); }
  };

  const share = async () => {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      const file = new File([blob], 'my-glow.png', { type: 'image/png' });
      if ((navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'My Glow — Glamour\'s Touch', text: '২৮ দিনে আমার ত্বক! 🇰🇷 glamourstouch.com' });
        setShared(true);
      } else {
        const a = document.createElement('a'); a.href = result; a.download = 'my-glow.png'; a.click();
      }
    } catch { /* ignore */ }
  };

  const reset = () => { setPhoto(null); setResult(null); setSelected(null); setError(''); setAnalysis(null); };

  const saveImage = () => {
    if (!result) return;
    const a = document.createElement('a'); a.href = result; a.download = 'my-glow-glamourstouch.png'; a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gthead to-gtdark pt-24 sm:pt-28 pb-16">
      <SEO title="Glow AI Predictor Studio | 28 Day Glow Test & AI Skin Analysis BD" description="Try Bangladesh's first K-Beauty AI skin analyzer. Upload your photo, select your Korean skincare product, and see your 28-day skin glow prediction at Glamour's Touch." url="/glow-predictor" />
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-gold text-[10px] font-bold tracking-[0.25em] uppercase mb-3 px-3 py-1 rounded-full border border-gold/30 bg-gold/10">✨ K-Beauty AI Studio</span>
          <h1 className="text-xl sm:text-3xl font-display font-extrabold text-white leading-tight">GLOW AI PREDICTOR <span className="gt-gold-shiny">STUDIO</span></h1>
          <p className="text-white/60 text-sm mt-2">কেনার আগে দেখুন — এই পণ্য ~২৮ দিন ব্যবহারে <span className="text-gold">আপনার নিজের ত্বকে</span> কেমন ফল দেবে।</p>
          <p className="text-white/45 text-xs mt-2.5 max-w-lg mx-auto leading-relaxed">এটি সাধারণ ফিল্টার নয় — প্রতিটি পণ্যের <span className="text-gold/90 font-semibold">আসল উপাদান ও ব্যবহারবিধির (use-case)</span> ভিত্তিতে AI বাস্তব সম্ভাব্য ফল তৈরি করে।</p>
        </div>

        {result ? (
          /* ── Result ── */
          <div className="bg-white/5 border border-gold/20 rounded-3xl p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <img src={photo!} alt="আগে" className="rounded-2xl w-full aspect-square object-cover" />
                <p className="text-xs font-bold text-white/50 mt-2">এখন</p>
              </div>
              <div className="text-center">
                <img src={result} alt="২৮ দিন পর" className="rounded-2xl w-full aspect-square object-cover ring-2 ring-gold" />
                <p className="text-xs font-bold text-gold mt-2">~২৮ দিন পর (AI)</p>
              </div>
            </div>
            {selected && (
              <p className="text-center text-white/70 text-sm mt-4">
                <span className="text-gold font-bold">{selected.name}</span> — {selected.brand} · ৳{selected.price}
              </p>
            )}

            {/* ── 🧪 Gemini AI analysis: glow score + metric bars + summary + combo ── */}
            {analysis ? (
              <div className="mt-5 rounded-2xl border border-gold/20 bg-black/30 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5b83a" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(analysis.glowScore / 100) * 97.4} 97.4`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-gold font-black text-base">{analysis.glowScore}%</span>
                  </div>
                  <div>
                    <p className="text-gold text-[11px] font-bold tracking-wide uppercase">🧪 Gemini AI বিশ্লেষণ</p>
                    <p className="text-white/60 text-[11px] leading-relaxed mt-0.5">এই পণ্য আপনার ত্বকের জন্য <b className="text-white">{analysis.glowScore}%</b> উপযোগী — নিয়মিত <b className="text-white">{analysis.days} দিন</b> ব্যবহারে সম্ভাব্য ফল:</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {analysis.metrics.map((m: any, i: number) => {
                    const neg = String(m.value).trim().startsWith('-');
                    const pct = Math.min(100, Math.abs(parseInt(String(m.value).replace(/[^\d]/g, '')) || 0));
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-white/70">{m.label}</span>
                          <span className={neg ? 'text-emerald-400 font-bold' : 'text-gold font-bold'}>{m.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: neg ? '#34d399' : 'linear-gradient(90deg,#bf953f,#fcf6ba)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {analysis.summary && <p className="text-white/70 text-xs leading-relaxed mb-3">{analysis.summary}</p>}

                {analysis.combo?.length > 0 && (
                  <div className="rounded-xl bg-gold/10 border border-gold/25 p-3">
                    <p className="text-gold text-[11px] font-bold mb-1.5">🧴 এই ত্বকের জন্য সম্পূর্ণ রুটিনে সাথে নিন:</p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {analysis.combo.map((c: string, i: number) => (
                        <span key={i} className="text-[11px] bg-white/10 text-white/85 px-2.5 py-1 rounded-full border border-white/10">{c}</span>
                      ))}
                    </div>
                    <a href={`https://wa.me/8801712426871?text=${encodeURIComponent(`আমি "${selected?.name}" সহ ১ মাসের গ্লো রুটিন (কম্বো) অর্ডার করতে চাই।`)}`} target="_blank" rel="noopener noreferrer"
                      className="block text-center gt-shiny py-2.5 rounded-full font-bold text-sm">
                      🛍️ Buy 1-Month Glow Routine
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-center gap-2 text-white/40 text-xs py-3">
                <Loader2 size={14} className="animate-spin text-gold" /> Gemini AI বিশ্লেষণ তৈরি হচ্ছে...
              </div>
            )}

            <div className="flex gap-2.5 mt-5">
              <button onClick={share} className="flex-1 gt-shiny py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm">
                {shared ? <><Check size={17} /> শেয়ার হয়েছে</> : <><Share2 size={17} /> Share</>}
              </button>
              <button onClick={saveImage} className="flex-1 bg-white/10 border border-white/15 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm">
                <Download size={17} /> Save
              </button>
              <a href={`/product/${selected?.id}`} className="flex-1 bg-emerald-500 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm">
                অর্ডার
              </a>
            </div>
            <button onClick={reset} className="w-full mt-3 text-white/60 py-2 text-sm font-bold flex items-center justify-center gap-2">
              <RotateCcw size={15} /> নতুন করে চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            {/* ── Step 1: your photo ── */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 mb-4">
              <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">ধাপ ১ — আপনার ছবি</p>
              {mode === 'camera' ? (
                <div className="relative">
                  <video ref={videoRef} playsInline muted className="w-full rounded-2xl bg-black aspect-[3/4] object-cover" />
                  <div className="flex gap-3 mt-3">
                    <button onClick={capture} className="flex-1 bg-gold text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2">
                      <Camera size={18} /> ছবি তুলুন
                    </button>
                    <button onClick={stopCamera} className="px-5 bg-white/10 text-white rounded-full"><X size={18} /></button>
                  </div>
                </div>
              ) : photo ? (
                <div className="relative">
                  <img src={photo} alt="আপনার ছবি" className="w-full rounded-2xl aspect-[3/4] object-cover max-h-80 mx-auto" />
                  <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"><X size={16} /></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={startCamera} className="flex flex-col items-center gap-2 bg-gold/15 border border-gold/30 text-gold py-7 rounded-2xl font-bold hover:bg-gold/25 transition-all">
                    <Camera size={26} /> লাইভ সেলফি
                  </button>
                  <label className="flex flex-col items-center gap-2 bg-white/5 border border-white/15 text-white/80 py-7 rounded-2xl font-bold cursor-pointer hover:bg-white/10 transition-all">
                    <Upload size={26} /> ছবি আপলোড
                    <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  </label>
                </div>
              )}
            </div>

            {/* ── Step 2: pick a product (category-swipe over the live catalog) ── */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 mb-4">
              <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">ধাপ ২ — পণ্য বেছে নিন</p>

              {/* Category chips — swipe left/right */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button onClick={() => setCat('⭐')}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${cat === '⭐' ? 'bg-gold text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  ⭐ জনপ্রিয়
                </button>
                {cats.map((c) => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${cat === c ? 'bg-gold text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto">
                {shown.map((p) => (
                  <button key={p.id} onClick={() => setSelected(p)}
                    className={`text-left rounded-xl overflow-hidden border-2 transition-all ${selected?.id === p.id ? 'border-gold ring-2 ring-gold/40' : 'border-white/10'}`}>
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full aspect-square object-cover bg-white/5" />
                    <p className="text-[9px] text-white/80 px-1.5 py-1 truncate">{p.name}</p>
                  </button>
                ))}
                {shown.length === 0 && <p className="col-span-full text-white/40 text-xs text-center py-6">এই ক্যাটাগরিতে পণ্য নেই</p>}
              </div>
              {selected && <p className="text-white/70 text-xs mt-2.5">নির্বাচিত: <span className="text-gold font-bold">{selected.name}</span></p>}
            </div>

            {/* ── Predict ── */}
            <button onClick={predict} disabled={!photo || !selected || loading}
              className="w-full bg-gradient-to-r from-gold via-amber-500 to-gold text-white py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={19} className="animate-spin" /> AI ভাবছে... (১৫-৩০ সেকেন্ড)</> : <><Sparkles size={19} /> আমার ২৮ দিনের ত্বক দেখুন</>}
            </button>
            {(!photo || !selected) && <p className="text-white/40 text-xs text-center mt-2">ছবি দিন + একটি পণ্য বেছে নিন</p>}
          </>
        )}

        {error && <p className="text-red-400 text-sm font-bold text-center mt-4">{error}</p>}
        <p className="text-white/35 text-[10px] text-center mt-6 leading-relaxed max-w-md mx-auto">
          ⚠️ AI-generated visualization based on the product's real ingredients &amp; use-case. Actual results vary by skin type &amp; usage — not a medical guarantee.
        </p>
      </div>
    </div>
  );
};

export default GlowPredictor;
