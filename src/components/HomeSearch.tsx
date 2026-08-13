import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FlashBanner from './FlashBanner';

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
  const [cats, setCats] = useState<Cat[]>(INITIAL_CATS);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id,name,image')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setCats(data as Cat[]);
      });
  }, []);

  return (
    <section className="pt-24 sm:pt-28 pb-4 bg-gradient-to-b from-[#070709] via-[#0b0e11] to-[#0d1216]">
      {/* GLAMOUR'S TOUCH Headline Banner (Premium Gold + White Mix, No ১নং) */}
      <div className="max-w-5xl mx-auto px-3 mb-3.5 text-center">
        <div className="py-2 px-4 rounded-full bg-[#12161a] border border-gtgold/40 backdrop-blur-md shadow-lg inline-flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
            <span className="gt-gold-shiny">GLAMOUR'S</span> <span className="text-white">TOUCH</span>
          </span>
          <span className="text-gtgold font-bold text-xs">•</span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">বাংলাদেশের ১০০% অরিজিনাল কোরিয়ান কসমেটিকস শপ 🇰🇷</span>
        </div>
      </div>

      {/* 1. Dynamic Dashboard Hero Banner */}
      <FlashBanner />

      {/* 2. Swipeable Category Chips with Gold Rings */}
      <div className="mt-4 max-w-5xl mx-auto min-h-[96px]">
        {cats.length > 0 && (
          <div
            className="flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {cats.map((c) => {
              const srcUrl = CATEGORY_WEBP_IMAGES[c.name] || c.image || '/categories/skincare.webp';
              return (
                <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="flex-shrink-0 snap-start flex flex-col items-center gap-1.5 w-16 group">
                  <span className="gt-cat-ring w-16 h-16 block group-active:scale-95 transition-transform shadow-lg">
                    <span className="w-full h-full rounded-full overflow-hidden bg-[#161c20] flex items-center justify-center border border-gtgold/30">
                      <img
                        src={srcUrl}
                        alt={`${c.name} - Glamour's Touch`}
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-center text-gray-200 group-hover:text-gtgold line-clamp-2 leading-tight transition-colors">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Circular Trust Badges Row + AI Glow Scan Icon (User spec) */}
      <div className="max-w-4xl mx-auto px-4 mt-5">
        <div className="flex items-center justify-center gap-5 sm:gap-12 py-3.5 bg-[#0e1317]/90 rounded-2xl border border-gtgold/20 backdrop-blur-md shadow-xl overflow-x-auto">
          {/* 100% Authentic */}
          <div className="flex flex-col items-center gap-1.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-gtgold/50 bg-gtgold/10 text-gtgold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BadgeCheck size={20} className="text-gtgold" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-200 tracking-wider">100% Authentic</span>
          </div>

          {/* সারা দেশে COD */}
          <div className="flex flex-col items-center gap-1.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-gtgold/50 bg-gtgold/10 text-gtgold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Truck size={20} className="text-gtgold" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-200 tracking-wider">সারা দেশে COD</span>
          </div>

          {/* নিরাপদ পেমেন্ট */}
          <div className="flex flex-col items-center gap-1.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-gtgold/50 bg-gtgold/10 text-gtgold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} className="text-gtgold" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-200 tracking-wider">নিরাপদ পেমেন্ট</span>
          </div>

          {/* AI Glow Scan Link (User Spec) */}
          <Link to="/glow-predictor" className="flex flex-col items-center gap-1.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-gtgold/60 bg-gtgold/20 text-gtgold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles size={20} className="text-gtgold animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gtgold tracking-wider">AI Glow Scan</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSearch;

