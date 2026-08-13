import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Loader2, Sparkles, RotateCcw, ShoppingBag } from 'lucide-react';

interface Scan {
  skinType: string; glowScore: number;
  concerns: { name: string; level: string }[];
  ingredients: string[]; routine: string[]; combo: string[];
}

function resizeImage(dataUrl: string, max = 720): Promise<{ b64: string; mime: string }> {
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
      resolve({ b64: c.toDataURL('image/jpeg', 0.9).replace(/^data:[^;]+;base64,/, ''), mime: 'image/jpeg' });
    };
    img.src = dataUrl;
  });
}

const levelColor = (l: string) => (/বেশি/.test(l) ? 'text-gtred' : /মাঝারি/.test(l) ? 'text-amber-400' : 'text-emerald-400');

interface SkinScanModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
}

const SkinScanModal: React.FC<SkinScanModalProps> = ({ open, isOpen, onClose }) => {
  const isModalOpen = Boolean(open ?? isOpen);
  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const [photo, setPhoto] = useState<string | null>(null);
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setMode('idle'); };
  useEffect(() => () => stopCamera(), []);
  useEffect(() => { if (!isModalOpen) { stopCamera(); setPhoto(null); setScan(null); setError(''); } }, [isModalOpen]);

  const startCamera = async () => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1080 } } });
      streamRef.current = s; setMode('camera');
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } }, 60);
    } catch { setError('ক্যামেরা চালু হলো না — অনুমতি দিন বা "ছবি আপলোড" দিন।'); }
  };
  const capture = () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.92)); setScan(null); stopCamera();
  };
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 8_000_000) { setError('ছবি ৮MB-এর কম দিন।'); return; }
    const rd = new FileReader(); rd.onload = () => { setPhoto(rd.result as string); setScan(null); setError(''); }; rd.readAsDataURL(f);
  };

  const runScan = async () => {
    if (!photo) return;
    setLoading(true); setError(''); setScan(null);
    try {
      const { b64, mime } = await resizeImage(photo, 720);
      const r = await fetch('/api/skin-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: b64, mimeType: mime }) });
      const d = await r.json();
      if (d.concerns) setScan(d);
      else setError(d.error === 'AI not configured' ? 'AI সেটআপ হচ্ছে — একটু পরে।' : (d.detail || 'স্ক্যান করা গেল না, আবার চেষ্টা করুন।'));
    } catch { setError('সমস্যা হলো, আবার চেষ্টা করুন।'); } finally { setLoading(false); }
  };

  const comboMsg = scan ? `আমার AI Skin Scan অনুযায়ী (${scan.skinType}) ১ মাসের রুটিন কম্বো অর্ডার করতে চাই: ${scan.combo.join(', ')}` : '';

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            className="relative w-full sm:max-w-md gt-card rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-gtgold/20" style={{ background: '#141418' }}>
              <div>
                <span className="inline-flex items-center gap-1 text-gtgold text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-gtgold/30 bg-gtgold/10 mb-1">✨ K-Beauty AI Scan</span>
                <p className="text-white font-display font-bold leading-none">AI GLOW SKIN <span className="gt-gold-shiny">SCAN</span></p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"><X size={16} /></button>
            </div>

            <div className="p-4 overflow-y-auto">
              {!scan ? (
                <>
                  <p className="text-white/60 text-xs text-center mb-3">সেলফি তুলুন বা ছবি দিন — AI আপনার ত্বক বিশ্লেষণ করে <span className="text-gtgold">কোন পণ্য / কম্বো</span> লাগবে বলে দেবে।</p>
                  {mode === 'camera' ? (
                    <div>
                      <video ref={videoRef} playsInline muted className="w-full rounded-2xl bg-black aspect-[3/4] object-cover" />
                      <div className="flex gap-2 mt-3">
                        <button onClick={capture} className="flex-1 gt-shiny py-3 rounded-full font-bold flex items-center justify-center gap-2"><Camera size={17} /> ছবি তুলুন</button>
                        <button onClick={stopCamera} className="px-5 bg-white/10 text-white rounded-full"><X size={17} /></button>
                      </div>
                    </div>
                  ) : photo ? (
                    <div>
                      <div className="relative">
                        <img src={photo} alt="আপনার ছবি" className="w-full rounded-2xl aspect-[3/4] object-cover max-h-72 mx-auto" />
                        <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"><X size={15} /></button>
                      </div>
                      <button onClick={runScan} disabled={loading} className="w-full mt-3 gt-shiny py-3.5 rounded-full font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> স্ক্যান হচ্ছে...</> : <><Sparkles size={18} /> Start AI Scan</>}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={startCamera} className="flex flex-col items-center gap-2 bg-gtgold/12 border border-gtgold/30 text-gtgold py-7 rounded-2xl font-bold hover:bg-gtgold/20 transition-all"><Camera size={26} /> Live Selfie</button>
                      <label className="flex flex-col items-center gap-2 bg-white/5 border border-white/15 text-white/80 py-7 rounded-2xl font-bold cursor-pointer hover:bg-white/10 transition-all">
                        <Upload size={26} /> Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                      </label>
                    </div>
                  )}
                </>
              ) : (
                /* ── Scan result ── */
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5b83a" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(scan.glowScore / 100) * 97.4} 97.4`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-gtgold font-black text-base">{scan.glowScore}</span>
                    </div>
                    <div>
                      <p className="text-white/60 text-[11px]">আপনার ত্বকের ধরন</p>
                      <p className="text-white font-bold text-lg leading-tight">{scan.skinType}</p>
                      <p className="text-gtgold text-[10px] font-bold uppercase tracking-wide">Glow Score {scan.glowScore}/100</p>
                    </div>
                  </div>

                  <p className="text-gtgold text-[11px] font-bold uppercase tracking-wide mb-1.5">যা খেয়াল করলাম</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {scan.concerns.map((c, i) => (
                      <span key={i} className="text-[11px] bg-white/8 border border-white/10 px-2.5 py-1 rounded-full text-white/85">{c.name} <b className={levelColor(c.level)}>· {c.level}</b></span>
                    ))}
                  </div>

                  {scan.routine.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gtgold text-[11px] font-bold uppercase tracking-wide mb-1.5">সাজেস্টেড রুটিন</p>
                      <ol className="space-y-1">
                        {scan.routine.map((s, i) => (
                          <li key={i} className="text-white/75 text-xs flex gap-2"><span className="text-gtgold font-bold">{i + 1}.</span> {s}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="rounded-xl bg-gtgold/10 border border-gtgold/25 p-3">
                    <p className="text-gtgold text-[11px] font-bold mb-1.5">🧴 আপনার জন্য ১-মাসের কম্বো:</p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {scan.combo.map((c, i) => <span key={i} className="text-[11px] bg-white/10 text-white/85 px-2.5 py-1 rounded-full border border-white/10">{c}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/8801712426871?text=${encodeURIComponent(comboMsg)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center gt-shiny py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-1.5"><ShoppingBag size={15} /> Buy Routine</a>
                      <a href="/shop" className="flex-1 text-center bg-white/10 border border-white/15 text-white py-2.5 rounded-full font-bold text-sm">Shop</a>
                    </div>
                  </div>

                  <button onClick={() => { setScan(null); setPhoto(null); }} className="w-full mt-3 text-white/55 py-2 text-sm font-bold flex items-center justify-center gap-2"><RotateCcw size={14} /> আবার স্ক্যান করুন</button>
                  <p className="text-white/35 text-[10px] text-center mt-1">⚠️ AI cosmetic guidance — চিকিৎসা নয়।</p>
                </div>
              )}
              {error && <p className="text-gtred text-xs font-bold text-center mt-3">{error}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkinScanModal;
