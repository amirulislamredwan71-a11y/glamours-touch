import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, BadgeCheck, Truck, ShieldCheck, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SkinScanModal from './SkinScanModal';

interface P {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  market_price: number | null;
  image: string;
}
interface Cat {
  id: string;
  name: string;
  image: string | null;
}

/**
 * Search-first hero for the homepage.
 * Full-width dynamic search with live product dropdown + swipeable category chips.
 * Replaces the old static banner. Deep-links straight to /product/:id.
 */
const HomeSearch = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<P[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [{ data: pd }, { data: cd }] = await Promise.all([
        supabase.from('products').select('id,name,brand,price,market_price,image'),
        supabase.from('categories').select('id,name,image').order('created_at', { ascending: true }),
      ]);
      if (pd) setProducts(pd as P[]);
      if (cd) setCats(cd as Cat[]);
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
    <section className="pt-24 sm:pt-28 pb-4 bg-gradient-to-b from-gthead to-gtdark">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-center text-gold text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-3">
          🇰🇷 বাংলাদেশের Trending Korean Beauty
        </p>

        {/* Full-width dynamic search */}
        <div ref={boxRef} className="relative">
          <form onSubmit={submit}>
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Medicube, Anua, sunscreen... খুঁজুন"
              aria-label="Search products"
              className="w-full bg-white rounded-full pl-12 pr-24 py-3.5 sm:py-4 text-sm sm:text-base text-charcoal placeholder:text-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); setOpen(false); }}
                className="absolute right-[52px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal">
                <X size={18} />
              </button>
            )}
            {/* AI Skin Scan camera */}
            <button type="button" onClick={() => setScanOpen(true)} title="AI Skin Scan — মুখ স্ক্যান করুন"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full gt-shiny flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <Camera size={17} />
            </button>
          </form>

          {open && matches.length > 0 && (
            <div className="absolute z-40 mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {matches.map(p => {
                const off = p.market_price && p.price ? Math.round((1 - p.price / p.market_price) * 100) : 0;
                return (
                  <button key={p.id} type="button"
                    onClick={() => { navigate(`/product/${p.id}`); setOpen(false); setQ(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                    <img src={p.image} alt="" loading="lazy"
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

      {/* Swipeable square category chips */}
      {cats.length > 0 && (
        <div className="mt-4 max-w-5xl mx-auto">
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {cats.map(c => (
              <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex-shrink-0 snap-start flex flex-col items-center gap-1.5 w-16 group">
                <span className="gt-cat-ring w-16 h-16 block group-active:scale-95 transition-transform">
                  <span className="w-full h-full rounded-full overflow-hidden bg-gtcard flex items-center justify-center">
                    {c.image
                      ? <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover rounded-full" />
                      : <span className="text-gtgold text-lg font-bold">{c.name.slice(0, 1)}</span>}
                  </span>
                </span>
                <span className="text-[9px] text-white/75 font-medium text-center leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
    <SkinScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </>
  );
};

export default HomeSearch;
