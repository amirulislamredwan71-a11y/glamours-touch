import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, BadgeCheck, Truck, ShieldCheck, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SkinScanModal from './SkinScanModal';

import { optimizeImageUrl } from '../lib/imageUtils';

interface P {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  market_price: number | null;
  image: string;
}
const CATEGORY_WEBP_IMAGES: Record<string, string> = {
  'Serum & Essence': '/categories/serum_essence.webp',
  'Moisturizer & Cream': '/categories/moisturizer_cream.webp',
  'Cleanser': '/categories/cleanser.webp',
  'Sunscreen': '/categories/sunscreen.webp',
  'Hair Care': '/categories/hair_care.webp',
  'Skincare': '/categories/skincare.webp',
  'Body Care': '/categories/body_care.webp',
  'Toner': '/categories/toner.webp',
  'Masks & Exfoliators': '/categories/masks_exfoliators.webp',
  'D A B O All In One Care': '/categories/dabo_care.webp',
  'Face Care': '/categories/face_care.webp',
  'Eye Care': '/categories/eye_care.webp',
  'Makeup & Lip': '/categories/makeup_lip.webp',
  'Serum & Treatment': '/categories/serum_treatment.webp',
  'Fragrance': '/categories/fragrance.webp',
  'Medicube Skin Care': '/categories/medicube_care.webp',
  'Baby & Mom Care': '/categories/baby_mom.webp',
};

interface Cat {
  id: string;
  name: string;
  image: string;
}

const INITIAL_CATS: Cat[] = [
  { id: '1', name: 'Serum & Essence', image: '/categories/serum_essence.webp' },
  { id: '2', name: 'Moisturizer & Cream', image: '/categories/moisturizer_cream.webp' },
  { id: '3', name: 'Cleanser', image: '/categories/cleanser.webp' },
  { id: '4', name: 'Sunscreen', image: '/categories/sunscreen.webp' },
  { id: '5', name: 'Hair Care', image: '/categories/hair_care.webp' },
  { id: '6', name: 'Skincare', image: '/categories/skincare.webp' },
  { id: '7', name: 'Body Care', image: '/categories/body_care.webp' },
  { id: '8', name: 'Toner', image: '/categories/toner.webp' },
  { id: '9', name: 'Masks & Exfoliators', image: '/categories/masks_exfoliators.webp' },
  { id: '10', name: 'D A B O All In One Care', image: '/categories/dabo_care.webp' },
  { id: '11', name: 'Face Care', image: '/categories/face_care.webp' },
  { id: '12', name: 'Eye Care', image: '/categories/eye_care.webp' },
  { id: '13', name: 'Makeup & Lip', image: '/categories/makeup_lip.webp' },
  { id: '14', name: 'Serum & Treatment', image: '/categories/serum_treatment.webp' },
];

const HomeSearch = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<P[]>([]);
  const [cats, setCats] = useState<Cat[]>(INITIAL_CATS);
  const [scanOpen, setScanOpen] = useState(false);
  const [offer, setOffer] = useState<string>('🎉 লঞ্চ অফার — সব পণ্যে ছাড় চলছে! অর্ডার করুন 📞 01712-426871');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [{ data: pd }, { data: cd }, { data: od }] = await Promise.all([
        supabase.from('products').select('id,name,brand,price,market_price,image').limit(60),
        supabase.from('categories').select('id,name,image').order('created_at', { ascending: true }),
        supabase.from('site_settings').select('value').eq('key', 'offer').maybeSingle(),
      ]);
      if (pd) setProducts(pd as P[]);
      if (cd) setCats(cd as Cat[]);
      if (od && typeof od.value === 'string') setOffer(od.value); // admin-controllable via site_settings key 'offer' (empty = hide)
    })();
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const term = q.trim().toLowerCase();
  const matches = term
    ? products
        .filter(p => p.name.toLowerCase().includes(term) || (p.brand || '').toLowerCase().includes(term))
        .slice(0, 6)
    : [];

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (term) {
      navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  return (
    <>
    <section className="pt-24 sm:pt-28 pb-4 bg-gradient-to-b from-gthead to-gtdark min-h-[220px]">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-center text-gtgoldsoft text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-3">
          🇰🇷 বাংলাদেশের Trending Korean Beauty
        </p>

        {/* Full-width dynamic search */}
        <div ref={boxRef} className="relative">
          <form onSubmit={submit} className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gtgold pointer-events-none z-10" />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Medicube, Anua, sunscreen..."
              aria-label="Search products"
              className="w-full bg-[#111116] border border-gtgold/40 rounded-full pl-11 pr-28 py-3 sm:py-3.5 text-xs sm:text-sm text-white placeholder:text-white/40 shadow-xl focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold"
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); setOpen(false); }}
                className="absolute right-24 text-white/50 hover:text-white">
                <X size={16} />
              </button>
            )}
            <div className="absolute right-1.5 flex items-center gap-1.5">
              <button type="button" onClick={() => setScanOpen(true)} title="AI Skin Scan — মুখ স্ক্যান করুন"
                className="w-8 h-8 rounded-full bg-[#18181e] border border-gtgold/30 text-gtgold flex items-center justify-center shadow-md active:scale-90 transition-transform">
                <Camera size={15} />
              </button>
              <button type="submit"
                className="gt-shiny text-charcoal font-bold text-xs px-3.5 sm:px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform">
                খুঁজুন
              </button>
            </div>
          </form>

          {open && matches.length > 0 && (
            <div className="absolute z-40 mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {matches.map(p => {
                const off = p.market_price && p.price ? Math.round((1 - p.price / p.market_price) * 100) : 0;
                return (
                  <button key={p.id} type="button"
                    onClick={() => { navigate(`/product/${p.id}`); setOpen(false); setQ(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                    <img src={optimizeImageUrl(p.image, 100, 80)} alt={`${p.name} - Glamour's Touch`} width="44" height="44" loading="lazy" decoding="async"
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs sm:text-sm text-charcoal font-medium truncate">{p.name}</span>
                      <span className="text-gold font-bold text-xs">৳{p.price}</span>
                      {off > 0 && <span className="text-[10px] text-gray-400 line-through ml-1">৳{p.market_price}</span>}
                    </span>
                  </button>
                );
              })}
              <button type="button" onClick={() => submit()}
                className="w-full text-center py-2.5 text-xs font-bold text-gold hover:bg-gold/5">
                সব ফলাফল দেখুন →
              </button>
            </div>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mt-3 text-white/70 text-[9px] sm:text-[11px] font-semibold">
          <span className="flex items-center gap-1"><BadgeCheck size={13} className="text-gold" /> 100% Authentic</span>
          <span className="flex items-center gap-1"><Truck size={13} className="text-gold" /> সারা দেশে COD</span>
          <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-gold" /> নিরাপদ পেমেন্ট</span>
        </div>
      </div>

      {/* Swipeable square category chips with fixed height for zero CLS */}
      <div className="mt-4 max-w-5xl mx-auto min-h-[96px]">
        {cats.length > 0 && (
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {cats.map((c, idx) => {
              const srcUrl = CATEGORY_WEBP_IMAGES[c.name] || c.image || '/categories/skincare.webp';
              return (
                <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="flex-shrink-0 snap-start flex flex-col items-center gap-1.5 w-16 group">
                  <span className="gt-cat-ring w-16 h-16 block group-active:scale-95 transition-transform">
                    <span className="w-full h-full rounded-full overflow-hidden bg-gtcard flex items-center justify-center">
                      <img
                        src={srcUrl}
                        alt={`${c.name} - Glamour's Touch`}
                        width="64"
                        height="64"
                        loading={idx < 6 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/categories/skincare.webp';
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-[9px] text-white/75 font-medium text-center leading-tight">{c.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
    <SkinScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </>
  );
};

export default HomeSearch;
