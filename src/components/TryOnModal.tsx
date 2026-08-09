import React, { useState } from 'react';
import { X, Upload, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Product } from '../types';

interface Props { product: Product; onClose: () => void; }

/** Cosmetics AR "try-on": upload your photo → AI preview of the product's likely ~28-day skin result. */
const TryOnModal: React.FC<Props> = ({ product, onClose }) => {
  const [userImg, setUserImg] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6_000_000) { setError('ছবিটি খুব বড় — ৬MB-এর কম একটা ছবি দিন।'); return; }
    const rd = new FileReader();
    rd.onload = () => { setUserImg(rd.result as string); setResult(null); setError(''); };
    rd.readAsDataURL(f);
  };

  const generate = async () => {
    if (!userImg) return;
    setLoading(true); setError('');
    try {
      const mimeType = userImg.match(/^data:([^;]+)/)?.[1] || 'image/jpeg';
      const effect = (product.description || '').replace(/<[^>]*>/g, '').slice(0, 200);
      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: userImg, mimeType, productName: product.name, effect, days: 28 }),
      });
      const d = await r.json();
      if (d.image) setResult(d.image);
      else setError(d.error === 'GEMINI_API_KEY not configured on the server' ? 'AI এখনো সেটআপ হচ্ছে — একটু পরে চেষ্টা করুন।' : (d.detail || 'তৈরি করা গেল না, আবার চেষ্টা করুন।'));
    } catch {
      setError('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
            <Sparkles size={18} className="text-gold" /> AI Try-On
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-charcoal"><X size={22} /></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          আপনার মুখের ছবি দিন — <b>{product.name}</b> প্রায় ২৮ দিন ব্যবহারে ত্বকে সম্ভাব্য ফল AI দিয়ে দেখুন।
        </p>

        {!result && (
          <>
            <label className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-gold/5 border-2 border-dashed border-gold/30 rounded-2xl cursor-pointer hover:bg-gold/10 transition-all text-gold font-bold">
              {userImg ? (
                <img src={userImg} alt="আপনার ছবি" className="max-h-52 rounded-xl object-contain" />
              ) : (
                <><Upload size={26} /> মুখের ছবি আপলোড করুন</>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
            {userImg && (
              <button onClick={generate} disabled={loading}
                className="mt-4 w-full bg-charcoal text-white py-4 rounded-full font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 size={18} className="animate-spin" /> তৈরি হচ্ছে... (১৫-৩০ সেকেন্ড)</> : <><Sparkles size={18} /> ফলাফল দেখুন</>}
              </button>
            )}
          </>
        )}

        {result && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <img src={userImg!} alt="আগে" className="rounded-xl w-full object-cover aspect-square" />
                <p className="text-xs font-bold text-gray-500 mt-1">আগে</p>
              </div>
              <div className="text-center">
                <img src={result} alt="সম্ভাব্য ফল" className="rounded-xl w-full object-cover aspect-square ring-2 ring-gold" />
                <p className="text-xs font-bold text-gold mt-1">~২৮ দিন পর (AI)</p>
              </div>
            </div>
            <button onClick={() => { setResult(null); }}
              className="mt-4 w-full bg-gray-100 text-charcoal py-3 rounded-full font-bold flex items-center justify-center gap-2">
              <RotateCcw size={16} /> আবার চেষ্টা করুন
            </button>
          </>
        )}

        {error && <p className="text-red-500 text-xs font-bold mt-3 text-center">{error}</p>}
        <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed">
          ⚠️ এটি AI-এর তৈরি একটি অনুমান/visualization মাত্র — প্রকৃত ফল ব্যক্তি, ত্বক ও ব্যবহারভেদে ভিন্ন হতে পারে। এটি কোনো চিকিৎসা বা নিশ্চয়তা নয়।
        </p>
      </div>
    </div>
  );
};

export default TryOnModal;
