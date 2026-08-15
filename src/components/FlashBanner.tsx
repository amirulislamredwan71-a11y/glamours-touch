import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImageUrl } from '../lib/imageUtils';

interface Banner { id: string; image: string; link: string | null; title: string | null; }

/* Initial static fallback luxury product masterpiece hero banner for instant LCP paint and zero layout shift */
const DEFAULT_HERO_BANNER: Banner = {
  id: 'default_hero',
  image: 'https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/cosrx_snail_masterpiece_banner_1786644945206.jpg',
  link: '/shop',
  title: "Glamour's Touch 100% Authentic Korean Skincare"
};

const FlashBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([DEFAULT_HERO_BANNER]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase
      .from('promo_banners')
      .select('id, image, link, title')
      .eq('active', true)
      .order('sort', { ascending: true })
      .then(({ data }) => { if (data && data.length > 0) setBanners(data as Banner[]); });
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[Math.min(idx, banners.length - 1)];
  const img = (
    <img
      src={optimizeImageUrl(b.image, 1200, 80)}
      alt={b.title || 'Flash Sale'}
      width="1200"
      height="450"
      fetchPriority="high"
      decoding="async"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover"
    />
  );

  return (
    <section className="bg-gtdark">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl aspect-[16/6] sm:aspect-[16/5] border-2 border-gtgold/40">
          {b.link ? <a href={b.link} className="block w-full h-full">{img}</a> : img}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              {banners.map((_, i) => (
                <button key={i} aria-label={`banner ${i + 1}`} onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-gtgold shadow-md' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlashBanner;
