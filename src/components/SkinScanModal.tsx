import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Loader2, Sparkles, RotateCcw, ShoppingBag, MessageCircle, Plus, Check, Heart, Droplets, Sun, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

interface Scan {
  skinType: string;
  glowScore: number;
  concerns: { name: string; level: string }[];
  ingredients: string[];
  routine: string[];
  combo: string[];
  lifestyleTips?: string[];
}

interface ProductComboItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  market_price: number;
  image: string;
  in_stock: boolean;
  reason?: string;
  concernKey: string;
}

const KBEAUTY_EXPANDED_POOL: Record<string, ProductComboItem> = {
  // Cleansers
  cosrx_salicylic: {
    id: 'p_1',
    name: 'COSRX Salicylic Acid Daily Gentle Cleanser 150 ml',
    brand: 'COSRX',
    price: 980,
    market_price: 1300,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/c0ffb1a8-5ab2-4dcd-a8c0-f139ce392f3d.jpg',
    in_stock: true,
    concernKey: 'ব্রণ',
    reason: 'ব্রণের ব্যাকটেরিয়া ও পিম্পল দূর করে'
  },
  cosrx_low_ph: {
    id: 'p_2',
    name: 'COSRX Low pH Good Morning Gel Cleanser 150 ml',
    brand: 'COSRX',
    price: 950,
    market_price: 1350,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/c0ffb1a8-5ab2-4dcd-a8c0-f139ce392f3d.jpg',
    in_stock: true,
    concernKey: 'পোরস',
    reason: 'পোরস পরিষ্কার ও সিবাম ব্যালেন্স করে'
  },
  rice_cleanser: {
    id: 'p_3',
    name: 'The Face Shop Rice Water Bright Foaming Cleanser 150 ml',
    brand: 'The Face Shop',
    price: 980,
    market_price: 1400,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/5949e151-4143-4c3c-b863-d978edfd0c09.jpg',
    in_stock: true,
    concernKey: 'শুষ্কতা',
    reason: 'শুষ্ক ত্বককে সফট ও ব্রাইট রাখে'
  },
  dabo_cica_cleanser: {
    id: 'p_4',
    name: 'Dabo 7 In 1 Multi Cica Foam Cleanser 180 ml',
    brand: 'Dabo',
    price: 960,
    market_price: 1300,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/a90f97eb-3c8d-4d81-b8f1-cd063b0b48ce.jpg',
    in_stock: true,
    concernKey: 'অসমান টোন',
    reason: '৭-ইন-১ ফরম্যুলায় ত্বক ডিপ ক্লিন করে'
  },

  // Treatments & Serums
  axisy_dark_spot: {
    id: 'p_5',
    name: 'AXIS-Y Dark Spot Correcting Glow Serum 50 ml',
    brand: 'AXIS-Y',
    price: 1600,
    market_price: 2110,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-0f6e7ace-61fd-478d-a76a-b98417cbf249.jpg',
    in_stock: true,
    concernKey: 'মেছতা',
    reason: '৫% নিয়াসিনামাইড কালো দাগ ও মেছতা হালকা করে'
  },
  anua_txa_serum: {
    id: 'p_6',
    name: 'Anua Niacinamide 10% + TXA 4% Dark Spot Serum 30 ml',
    brand: 'Anua',
    price: 1950,
    market_price: 2600,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/a90f97eb-3c8d-4d81-b8f1-cd063b0b48ce.jpg',
    in_stock: true,
    concernKey: 'অসমান টোন',
    reason: 'অসমান ত্বকের টোন ও জেদি ছোপ দাগ দূর করে'
  },
  centella_ampoule: {
    id: 'p_7',
    name: 'SKIN1004 Madagascar Centella Ampoule 100 ml',
    brand: 'SKIN1004',
    price: 1750,
    market_price: 2200,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-9b9deea6-14ff-47ae-a15d-2fef7c4c5b61.jpg',
    in_stock: true,
    concernKey: 'ব্রণ',
    reason: '১০০% সেনটেলা নির্যাস লালচে ভাব ও পিম্পল শান্ত করে'
  },
  snail_mucin: {
    id: 'p_8',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence 100 ml',
    brand: 'COSRX',
    price: 1850,
    market_price: 2400,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/66280e1c-71ea-43aa-9b4f-1789f7cf01c6.jpg',
    in_stock: true,
    concernKey: 'শুষ্কতা',
    reason: '৯৬% স্নেল মিউসিন ত্বক গভীর থেকে হাইড্রেট ও স্মুথ করে'
  },
  medicube_pdrn: {
    id: 'p_9',
    name: 'Medicube PDRN Pink Peptide Serum 30 ml',
    brand: 'Medicube',
    price: 1950,
    market_price: 2420,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/a90f97eb-3c8d-4d81-b8f1-cd063b0b48ce.jpg',
    in_stock: true,
    concernKey: 'নিস্তেজ ভাব',
    reason: 'PDRN পেপটাইড গ্লাস গ্লো ও ত্বকের স্থিতিস্থাপকতা বাড়ায়'
  },

  // Moisturizers & Sunscreens
  boj_sunscreen: {
    id: 'p_10',
    name: 'Beauty of Joseon Relief Sun : Rice + Probiotics 50 ml',
    brand: 'Beauty of Joseon',
    price: 1600,
    market_price: 2220,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-597327be-ab09-42d4-a948-dd4111c1f9b1.jpg',
    in_stock: true,
    concernKey: 'সান প্রোটেকশন',
    reason: 'SPF50+ PA++++ ব্রড স্পেকট্রাম UV সুরক্ষা'
  },
  boj_dynasty: {
    id: 'p_11',
    name: 'Beauty of Joseon Dynasty Cream 50 ml',
    brand: 'Beauty of Joseon',
    price: 1850,
    market_price: 2500,
    image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-df2c0254-9b47-4bc5-9398-4371fd08359d.jpg',
    in_stock: true,
    concernKey: 'শুষ্কতা',
    reason: 'ত্বকে ডিপ ময়েশ্চার ও রাজকীয় গ্লো লক করে'
  }
};

function generateTrulyDynamicCombo(scan: Scan): ProductComboItem[] {
  const concerns = scan.concerns || [];
  const selected: ProductComboItem[] = [];
  const addedIds = new Set<string>();

  const skinType = scan.skinType || 'মিশ্র';
  const concernsStr = concerns.map(c => c.name).join(' ');

  // 1. Select 1 Specific Cleanser based on Skin Type & Primary Concern
  if (/তৈলাক্ত|ব্রণ/.test(skinType + concernsStr)) {
    selected.push(KBEAUTY_EXPANDED_POOL.cosrx_salicylic);
    addedIds.add(KBEAUTY_EXPANDED_POOL.cosrx_salicylic.id);
  } else if (/পোরস/.test(concernsStr)) {
    selected.push(KBEAUTY_EXPANDED_POOL.cosrx_low_ph);
    addedIds.add(KBEAUTY_EXPANDED_POOL.cosrx_low_ph.id);
  } else if (/অসমান টোন/.test(concernsStr)) {
    selected.push(KBEAUTY_EXPANDED_POOL.dabo_cica_cleanser);
    addedIds.add(KBEAUTY_EXPANDED_POOL.dabo_cica_cleanser.id);
  } else {
    selected.push(KBEAUTY_EXPANDED_POOL.rice_cleanser);
    addedIds.add(KBEAUTY_EXPANDED_POOL.rice_cleanser.id);
  }

  // 2. Select Target Treatment Serums ONLY for Detected Skin Concerns
  for (const c of concerns) {
    const name = c.name;
    if (/অসমান টোন/.test(name) && !addedIds.has(KBEAUTY_EXPANDED_POOL.anua_txa_serum.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.anua_txa_serum);
      addedIds.add(KBEAUTY_EXPANDED_POOL.anua_txa_serum.id);
    } else if (/কালো দাগ|মেছতা/.test(name) && !addedIds.has(KBEAUTY_EXPANDED_POOL.axisy_dark_spot.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.axisy_dark_spot);
      addedIds.add(KBEAUTY_EXPANDED_POOL.axisy_dark_spot.id);
    } else if (/ব্রণ/.test(name) && !addedIds.has(KBEAUTY_EXPANDED_POOL.centella_ampoule.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.centella_ampoule);
      addedIds.add(KBEAUTY_EXPANDED_POOL.centella_ampoule.id);
    } else if (/শুষ্কতা/.test(name) && !addedIds.has(KBEAUTY_EXPANDED_POOL.snail_mucin.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.snail_mucin);
      addedIds.add(KBEAUTY_EXPANDED_POOL.snail_mucin.id);
    } else if (/নিস্তেজ/.test(name) && !addedIds.has(KBEAUTY_EXPANDED_POOL.medicube_pdrn.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.medicube_pdrn);
      addedIds.add(KBEAUTY_EXPANDED_POOL.medicube_pdrn.id);
    }
  }

  // 3. Optional Finish Product (Sunscreen or Cream) ONLY if severe dryness or user has >2 concerns
  if (selected.length === 1) {
    if (skinType === 'শুষ্ক') {
      selected.push(KBEAUTY_EXPANDED_POOL.snail_mucin);
    } else {
      selected.push(KBEAUTY_EXPANDED_POOL.axisy_dark_spot);
    }
  } else if (concerns.length >= 3 || skinType === 'শুষ্ক') {
    if (skinType === 'শুষ্ক' && !addedIds.has(KBEAUTY_EXPANDED_POOL.boj_dynasty.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.boj_dynasty);
    } else if (!addedIds.has(KBEAUTY_EXPANDED_POOL.boj_sunscreen.id)) {
      selected.push(KBEAUTY_EXPANDED_POOL.boj_sunscreen);
    }
  }

  return selected;
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
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();

  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const [photo, setPhoto] = useState<string | null>(null);
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setMode('idle'); };
  useEffect(() => () => stopCamera(), []);
  useEffect(() => { if (!isModalOpen) { stopCamera(); setPhoto(null); setScan(null); setError(''); setAddedItems(new Set()); } }, [isModalOpen]);

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

  const dynamicCombo = scan ? generateTrulyDynamicCombo(scan) : [];
  const comboTotal = dynamicCombo.reduce((acc, item) => acc + item.price, 0);

  const defaultLifestyleTips = [
    '💧 প্রতিদিন অন্তত ২.৫ থেকে ৩ লিটার পরিষ্কার পানি পান করুন — ত্বক ভেতর থেকে সতেজ থাকবে।',
    '🥗 অতিরিক্ত তেলে ভাজা ও মিষ্টি জাতীয় খাবার কম খান — এতে ব্রণের মাত্রা অনেক কমে যায়।',
    '☀️ সকালে বা রোদে বের হওয়ার ১৫ মিনিট আগে অবশ্যই সানস্ক্রিন লাগান ও নিয়মিত মুখ পরিষ্কার রাখুন।'
  ];
  const tipsToDisplay = (scan?.lifestyleTips && scan.lifestyleTips.length > 0) ? scan.lifestyleTips : defaultLifestyleTips;

  const handleAddSingleProduct = (p: ProductComboItem) => {
    addToCart({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      market_price: p.market_price,
      image: p.image,
      in_stock: p.in_stock,
      rating: 5,
      reviews: 42,
      category: 'Skincare',
      description: p.reason || 'AI Skin Scan Recommended Product'
    });
    setAddedItems(prev => new Set(prev).add(p.id));
  };

  const handleBuyFullRoutineOnWebsite = () => {
    clearCart();
    dynamicCombo.forEach(p => {
      addToCart({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        market_price: p.market_price,
        image: p.image,
        in_stock: p.in_stock,
        rating: 5,
        reviews: 42,
        category: 'Skincare',
        description: p.reason || 'AI Skin Scan Recommended Routine Product'
      });
    });
    onClose();
    navigate('/checkout');
  };

  const comboMsg = scan ? `আমার AI Skin Scan অনুযায়ী (${scan.skinType}) ${dynamicCombo.length} টি প্রোডাক্টের কাস্টম রুটিন কম্বো (মোট ৳${comboTotal}) অর্ডার করতে চাই: ${dynamicCombo.map(p => `${p.name} (৳${p.price})`).join(', ')}` : '';

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            className="relative w-full sm:max-w-md gt-card rounded-3xl overflow-hidden max-h-[92dvh] min-h-[65dvh] sm:min-h-0 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-gtgold/20" style={{ background: '#141418' }}>
              <div>
                <span className="inline-flex items-center gap-1 text-gtgold text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-gtgold/30 bg-gtgold/10 mb-1">✨ K-Beauty AI Holistic Care</span>
                <p className="text-white font-display font-bold leading-none">AI GLOW SKIN <span className="gt-gold-shiny">MENTOR</span></p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"><X size={16} /></button>
            </div>

            <div className={`p-4 overflow-y-auto flex-1 min-h-0 overscroll-contain flex flex-col ${!scan ? 'justify-center' : ''}`}>
              {!scan ? (
                <>
                  <p className="text-white/60 text-xs text-center mb-3">সেলফি তুলুন বা ছবি দিন — AI আপনার ত্বকের অবস্থা বিশ্লেষণ করে <span className="text-gtgold">লাইফস্টাইল গাইড ও উপযুক্ত প্রোডাক্ট পরামর্শ</span> প্রদান করবে।</p>
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
                        {loading ? <><Loader2 size={18} className="animate-spin" /> স্ক্যান হচ্ছে...</> : <><Sparkles size={18} /> Start AI Care Analysis</>}
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
                      <p className="text-white/60 text-[11px]">আপনার ত্বকের বর্তমান ধরন</p>
                      <p className="text-white font-bold text-lg leading-tight">{scan.skinType}</p>
                      <p className="text-gtgold text-[10px] font-bold uppercase tracking-wide">Glow Health Score {scan.glowScore}/100</p>
                    </div>
                  </div>

                  <p className="text-gtgold text-[11px] font-bold uppercase tracking-wide mb-1.5">যা খেয়াল করলাম</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {scan.concerns.map((c, i) => (
                      <span key={i} className="text-[11px] bg-white/8 border border-white/10 px-2.5 py-1 rounded-full text-white/85">{c.name} <b className={levelColor(c.level)}>· {c.level}</b></span>
                    ))}
                  </div>

                  {/* ── EMPATHETIC HOLISTIC LIFESTYLE & DIET CARE ── */}
                  <div className="mb-3.5 bg-gradient-to-r from-amber-500/10 via-gtgold/10 to-amber-500/10 border border-gtgold/30 rounded-2xl p-3">
                    <p className="text-gtgold text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-400 fill-rose-400" /> 🌿 আপনার ত্বকের প্রাকৃতিক যত্ন ও লাইফস্টাইল টিপস:
                    </p>
                    <ul className="space-y-1.5">
                      {tipsToDisplay.map((tip, idx) => (
                        <li key={idx} className="text-white/90 text-xs flex items-start gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="text-gtgold font-bold shrink-0">{idx + 1}.</span>
                          <span className="leading-snug">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {scan.routine.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gtgold text-[11px] font-bold uppercase tracking-wide mb-1.5">সহজ স্কিনকেয়ার রুটিন</p>
                      <ol className="space-y-1">
                        {scan.routine.map((s, i) => (
                          <li key={i} className="text-white/75 text-xs flex gap-2"><span className="text-gtgold font-bold">{i + 1}.</span> {s}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* ── Dynamic AI Custom Routine Combo Box ── */}
                  <div className="rounded-2xl bg-[#161d22] border-2 border-gtgold/40 p-3.5 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gtgold text-[12px] font-black flex items-center gap-1.5">🧴 আপনার ত্বকের জন্য {dynamicCombo.length}-টি প্রোডাক্টের রুটিন কম্বো:</p>
                      <span className="text-xs font-black text-white bg-gtgold/20 border border-gtgold/40 px-2 py-0.5 rounded-full">মোট ৳{comboTotal}</span>
                    </div>

                    {/* Individual Products Card List */}
                    <div className="space-y-2 mb-3">
                      {dynamicCombo.map((p, i) => {
                        const isAdded = addedItems.has(p.id);
                        return (
                          <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2 text-xs hover:border-gtgold/30 transition-all">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 shrink-0" />
                              <div className="min-w-0 pr-2">
                                <p className="text-white font-bold truncate leading-tight">{p.name}</p>
                                <p className="text-[10px] text-gtgoldsoft truncate">{p.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-gtgold font-black text-xs">৳{p.price}</span>
                              <button
                                onClick={() => handleAddSingleProduct(p)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  isAdded
                                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-gtgold/20 hover:bg-gtgold hover:text-black text-gtgold border border-gtgold/40'
                                }`}
                              >
                                {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={handleBuyFullRoutineOnWebsite} className="flex-1 gt-shiny text-black py-3 rounded-full font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:scale-[1.02] transition-all">
                        <ShoppingBag size={16} /> পুরো কম্বো ওয়েবসাইটে চেকআউট করুন (৳{comboTotal})
                      </button>
                      <a href={`https://wa.me/8801712426871?text=${encodeURIComponent(comboMsg)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg">
                        <MessageCircle size={16} /> WhatsApp Order
                      </a>
                    </div>
                  </div>

                  <button onClick={() => { setScan(null); setPhoto(null); }} className="w-full mt-3 text-white/55 py-2 text-sm font-bold flex items-center justify-center gap-2"><RotateCcw size={14} /> আবার স্ক্যান করুন</button>
                  <p className="text-white/35 text-[10px] text-center mt-1">⚠️ AI cosmetic & lifestyle guidance — চিকিৎসকের পরামর্শের বিকল্প নয়।</p>
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
