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
    "id": "b4dffc6f-e0cb-4808-9fbc-8ee4e6c67f6e",
    "name": "Cosrx Advanced Snail 96 Mucin Power Essence 100 ml ",
    "brand": "Cosrx ",
    "price": 1640,
    "market_price": 1970,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/66280e1c-71ea-43aa-9b4f-1789f7cf01c6.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "68207be1-917f-4370-8d08-d4d74b699d0a",
    "name": "Anua Niacinamide 10% + TXA 4% Serum 30 ml",
    "brand": "Anua",
    "price": 2150,
    "market_price": 2970,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-68207be1-917f-4370-8d08-d4d74b699d0a.jpg",
    "category": "Serum & Treatment",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "a41dfbea-53c1-4303-babe-a7a9748c0891",
    "name": "K-Secret Seoul 1988 Essence:Snail Mucin 97% + Rice 100 ml",
    "brand": "K-Secret",
    "price": 2070,
    "market_price": 2630,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-a41dfbea-53c1-4303-babe-a7a9748c0891.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "9bf95571-8a62-47dd-9d5c-4f7835161202",
    "name": "Medicube Glutathione Glow Serum 30 g, Koria",
    "brand": "Medicube",
    "price": 1720,
    "market_price": 2170,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/af61fdf6-6c6b-4aa8-9b39-0400afc04152.jpg",
    "category": "Serum & Treatment",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "0f6e7ace-61fd-478d-a76a-b98417cbf249",
    "name": "AXIS-Y Dark Spot Correcting Glow Toner 125 ml",
    "brand": "AXIS-Y",
    "price": 1810,
    "market_price": 2430,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-0f6e7ace-61fd-478d-a76a-b98417cbf249.jpg",
    "category": "Toner",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "2090c6be-c226-4f8a-bfec-4cb5c640d34e",
    "name": "Dabo Black Snail Retinal A+ Solution Ampoule 80 ml",
    "brand": "Dabo",
    "price": 1140,
    "market_price": 1440,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-2090c6be-c226-4f8a-bfec-4cb5c640d34e.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "91780c71-e30d-4e93-a173-8ead7cb6b074",
    "name": "Celimax The Vita-A Retinal Shot Tightening Booster 15 ml ",
    "brand": "Celimax",
    "price": 1460,
    "market_price": 2030,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/c4505869-f06f-440f-8632-47990724a01c.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "41484542-da4e-46ea-a942-b4db3f6fbbdb",
    "name": "Dr.Althea 147 Barrier Cream 50 ml",
    "brand": "Dr.Althea",
    "price": 2190,
    "market_price": 3040,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-41484542-da4e-46ea-a942-b4db3f6fbbdb.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "ba33b4ab-3932-452c-af0c-7e1375c3db8b",
    "name": "Medicube Kojic Acid Turmeric Vita Capsule Cream 53 g",
    "brand": "Medicube",
    "price": 2000,
    "market_price": 2500,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-ba33b4ab-3932-452c-af0c-7e1375c3db8b.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "5c3c0a80-ba41-44ae-9856-1af5a24de21d",
    "name": "Medicube Collagen Jelly Cream 110 ml",
    "brand": "Medicube",
    "price": 2190,
    "market_price": 2740,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-5c3c0a80-ba41-44ae-9856-1af5a24de21d.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "5f6ff399-9dd8-4258-8663-138901b4332e",
    "name": "Medicube Txa Niacinamide Capsule Cream 55 g ",
    "brand": "Medicube",
    "price": 2355,
    "market_price": 2920,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/a86771ac-941e-4a14-b2a0-8a763ef3e760.jpg",
    "category": "Medicube Skin Care ",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "a73e43e7-5d66-42ab-a3a4-03b82fbc2c2a",
    "name": "P.Calm Cato Cream 80 ml",
    "brand": "P.Calm",
    "price": 2640,
    "market_price": 3430,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-a73e43e7-5d66-42ab-a3a4-03b82fbc2c2a.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 120,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
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
        .limit(30);
      
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
              সকল প্রোডাক্ট দেখুন →
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
