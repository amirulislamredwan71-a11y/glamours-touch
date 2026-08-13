import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import FlashBanner from '../components/FlashBanner';
import HomeSearch from '../components/HomeSearch';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  description: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

const INITIAL_PRODUCTS = [
  {
    id: 'dabo-black-snail',
    name: 'DABO All In One Black Snail Repair Cream 100ml',
    brand: 'DABO',
    price: 980,
    market_price: 1200,
    image: '/categories/moisturizer_cream.webp',
    category: 'Moisturizer & Cream',
    rating: 4.9,
    reviews: 128,
    isFeatured: true,
    in_stock: true,
    stock: 15,
  },
  {
    id: 'anua-77-toner-250',
    name: 'Anua Heartleaf 77% Soothing Toner 250ml',
    brand: 'Anua',
    price: 1650,
    market_price: 1950,
    image: '/categories/toner.webp',
    category: 'Toner',
    rating: 4.9,
    reviews: 210,
    isFeatured: true,
    in_stock: true,
    stock: 20,
  },
  {
    id: 'boj-relief-sun',
    name: 'Beauty of Joseon Relief Sun: Rice + Probiotics 50ml',
    brand: 'Beauty of Joseon',
    price: 1350,
    market_price: 1600,
    image: '/categories/sunscreen.webp',
    category: 'Sunscreen',
    rating: 5.0,
    reviews: 340,
    isFeatured: true,
    in_stock: true,
    stock: 25,
  },
  {
    id: 'cosrx-96-mucin',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence 100ml',
    brand: 'COSRX',
    price: 1450,
    market_price: 1750,
    image: '/categories/serum_essence.webp',
    category: 'Serum & Essence',
    rating: 4.8,
    reviews: 290,
    isFeatured: true,
    in_stock: true,
    stock: 18,
  },
  {
    id: 'skin1004-ampoule-100',
    name: 'Skin1004 Madagascar Centella Ampoule 100ml',
    brand: 'Skin1004',
    price: 1550,
    market_price: 1850,
    image: '/categories/serum_essence.webp',
    category: 'Serum & Essence',
    rating: 4.9,
    reviews: 180,
    isFeatured: true,
    in_stock: true,
    stock: 12,
  },
  {
    id: 'medicube-zero-pad-70',
    name: 'Medicube Zero Pore Pad 2.0 (70 pads)',
    brand: 'Medicube',
    price: 1850,
    market_price: 2200,
    image: '/categories/masks_exfoliators.webp',
    category: 'Masks & Exfoliators',
    rating: 4.9,
    reviews: 150,
    isFeatured: true,
    in_stock: true,
    stock: 10,
  },
  {
    id: 'dr-althea-345-cream',
    name: 'Dr.Althea 345 Relief Cream 50ml',
    brand: 'Dr.Althea',
    price: 1750,
    market_price: 2100,
    image: '/categories/moisturizer_cream.webp',
    category: 'Moisturizer & Cream',
    rating: 5.0,
    reviews: 95,
    isFeatured: true,
    in_stock: true,
    stock: 8,
  },
  {
    id: 'laneige-lip-sleeping-mask',
    name: 'Laneige Lip Sleeping Mask Berry 20g',
    brand: 'Laneige',
    price: 1650,
    market_price: 1900,
    image: '/categories/makeup_lip.webp',
    category: 'Makeup & Lip',
    rating: 4.9,
    reviews: 230,
    isFeatured: true,
    in_stock: true,
    stock: 22,
  },
  {
    id: 'torriden-dive-in-serum',
    name: 'Torriden DIVE-IN Low Molecule Hyaluronic Acid Serum 50ml',
    brand: 'Torriden',
    price: 1680,
    market_price: 1980,
    image: '/categories/serum_essence.webp',
    category: 'Serum & Essence',
    rating: 4.9,
    reviews: 140,
    isFeatured: true,
    in_stock: true,
    stock: 14,
  },
  {
    id: 'numbuzin-3-serum',
    name: 'Numbuzin No.3 Skin Softening Serum 50ml',
    brand: 'Numbuzin',
    price: 1750,
    market_price: 2050,
    image: '/categories/serum_essence.webp',
    category: 'Serum & Essence',
    rating: 4.8,
    reviews: 110,
    isFeatured: true,
    in_stock: true,
    stock: 16,
  }
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterStatus, setNewsletterStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Featured Products - Targeted payload of top 20 featured products for ultra-fast mobile paint
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, brand, price, market_price, image, category, rating, reviews, isFeatured, stock, in_stock')
        .order('isFeatured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (productsData) {
        const PRIORITY_BRANDS = [
          'anua', 'beauty of joseon', 'cosrx', 'skin1004', 'medicube', 'dr.althea',
          'laneige', 'torriden', 'numbuzin', 'round lab', 'tirtir', 'unove', 'ryo',
          'lador', 'dabo'
        ];

        const sorted = [...productsData].sort((a, b) => {
          const aBrand = (a.brand || '').toLowerCase();
          const bBrand = (b.brand || '').toLowerCase();
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();

          const aPriority = PRIORITY_BRANDS.findIndex(brand => aBrand.includes(brand) || aName.includes(brand));
          const bPriority = PRIORITY_BRANDS.findIndex(brand => bBrand.includes(brand) || bName.includes(brand));

          const aRank = aPriority !== -1 ? aPriority : 999;
          const bRank = bPriority !== -1 ? bPriority : 999;

          if (aRank !== bRank) return aRank - bRank;
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
          return 0;
        });

        setFeaturedProducts(sorted);
      }

      // Fetch Categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('id, name, image')
        .limit(4);
      
      if (catsData) setCategories(catsData);
    };

    fetchData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error && error.code === '23505') {
        setNewsletterStatus('success');
      } else if (error) {
        throw error;
      } else {
        setNewsletterStatus('success');
      }
    } catch {
      setNewsletterStatus('success');
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gtdark">
      <SEO
        title="Authentic Korean Skincare & Cosmetics Bangladesh"
        description="Shop 100% authentic Korean skincare, K-Beauty serums, cleansers, sunscreens & creams in Bangladesh. Try our AI Glow Predictor Studio at Glamour's Touch."
        url="/"
      />
      {/* Search-first hero (replaces static banner) */}
      <HomeSearch />

      {/* All Products Section */}
      <FlashBanner />

      {/* NOTE: no trust/"why us" band here — it duplicates the compact trust strip under the
          search bar (HomeSearch). This was built & removed twice; do NOT re-add. */}

      <section className="py-10 sm:py-16 bg-gtdark relative overflow-hidden min-h-[480px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-10">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gtgold/60" />
            <h2 className="text-xs md:text-sm font-bold text-gtgoldsoft tracking-[0.3em] uppercase font-display">Recommended for You</h2>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gtgold/60" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4 min-h-[320px]">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <div key={product.id}>
                  <ProductCard product={product} priority={idx < 4} />
                </div>
              ))
            ) : (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="gt-card rounded-2xl h-[320px] animate-pulse bg-white/5 p-3 flex flex-col justify-between">
                  <div className="w-full aspect-square bg-white/10 rounded-xl mb-3" />
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              ))
            )}
          </div>

          {/* View All Products CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 gt-shiny text-charcoal font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 transition-transform"
            >
              সবকটি ৫০০+ প্রসাধনী দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-charcoal to-gtdark text-cream relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="text-gold font-bold tracking-[0.4em] uppercase text-xs mb-6 block">{t('newsletter.subtitle')}</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">{t('newsletter.title').split(' ')[0]} <span className="text-gold italic">{t('newsletter.title').split(' ').slice(1).join(' ')}</span></h2>
            <p className="text-gray-400 mb-12 text-xl font-light leading-relaxed max-w-2xl mx-auto">{t('newsletter.description')}</p>
            
            {newsletterStatus === 'success' ? (
              <div className="bg-white/5 backdrop-blur-md border border-gold/20 p-8 rounded-[2rem] text-gold font-bold tracking-widest uppercase">
                {t('newsletter.success')}
              </div>
            ) : (
              <form 
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 bg-white/5 p-2 rounded-[3rem] border border-white/10 backdrop-blur-md"
              >
                <input 
                  required
                  type="email" 
                  placeholder={t('newsletter.placeholder')} 
                  className="flex-grow bg-transparent border-none rounded-full px-8 py-5 focus:outline-none text-white placeholder:text-gray-500 font-light"
                />
                <button 
                  disabled={newsletterStatus === 'loading'}
                  className="bg-gold hover:bg-white hover:text-charcoal text-white px-12 py-5 rounded-full font-bold tracking-[0.2em] text-xs transition-all duration-500 shadow-xl shadow-gold/20 disabled:opacity-50 uppercase"
                >
                  {newsletterStatus === 'loading' ? '...' : t('newsletter.button')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
