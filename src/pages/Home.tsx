import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HomeSearch from '../components/HomeSearch';
import FlashBanner from '../components/FlashBanner';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  market_price: number | null;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  stock?: number;
  in_stock?: boolean;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

const INITIAL_PRODUCTS = [
  {
    "id": "001c6040-8da2-488a-84b4-71af397b2489",
    "name": "Dabo Baby Powder Perfume Shampoo 500 ml",
    "brand": "Dabo",
    "price": 1600,
    "market_price": 2440,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-001c6040-8da2-488a-84b4-71af397b2489.jpg",
    "category": "Hair Care",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "bb2e46d1-cfa9-40ba-942a-5886ab71e196",
    "name": "Dabo Dear Josephine Floral Perfume Shampoo 500 ml",
    "brand": "Dabo",
    "price": 1600,
    "market_price": 2530,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-bb2e46d1-cfa9-40ba-942a-5886ab71e196.jpg",
    "category": "Hair Care",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "57fbc7a0-a7b3-4feb-8c16-283ed830a922",
    "name": "Dabo Collagen Lifting Skin Care Set",
    "brand": "Dabo",
    "price": 3500,
    "market_price": 5040,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-57fbc7a0-a7b3-4feb-8c16-283ed830a922.jpg",
    "category": "Skincare",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "18b7d300-ddff-417e-a6f0-b0c2094e3752",
    "name": "FARMSTAY Collagen & Hyaluronic Acid All in one Ampoule",
    "brand": "FARMSTAY",
    "price": 1450,
    "market_price": 2180,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-18b7d300-ddff-417e-a6f0-b0c2094e3752.jpg",
    "category": "Serum & Essence",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "c9c43cc8-057e-4925-9a3c-b7e0a26374b0",
    "name": "Cloud 9 Blanc De Whitening Cream 50ml",
    "brand": "Cloud 9",
    "price": 1450,
    "market_price": 2100,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-c9c43cc8-057e-4925-9a3c-b7e0a26374b0.jpg",
    "category": "Moisturizer & Cream",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "9c8a452d-5fbd-4010-baf9-cd1fbd545c4f",
    "name": "The Face Shop Rice Water Bright Cleansing Cream 400ml",
    "brand": "The Face Shop",
    "price": 1850,
    "market_price": 2790,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-9c8a452d-5fbd-4010-baf9-cd1fbd545c4f.jpg",
    "category": "Face Care",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "1aba5bd1-79c1-4657-83fc-005dc1b0bfbf",
    "name": "Anjo Professional 24K Gold Skin Care 6 Set",
    "brand": "Anjo",
    "price": 9000,
    "market_price": 14060,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-1aba5bd1-79c1-4657-83fc-005dc1b0bfbf.jpg",
    "category": "Skincare",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "1c1a5e94-f569-44c3-b708-eb487b91441d",
    "name": "Innisfree Super Volcanic Pore Clay Mask 100 ml",
    "brand": "Innisfree",
    "price": 1750,
    "market_price": 2490,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-1c1a5e94-f569-44c3-b708-eb487b91441d.jpg",
    "category": "Masks & Exfoliators",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "ece0a408-579c-435e-b3ac-898f0169c5c3",
    "name": "Green Finger Strong Baby Moisturizing Intensive Cream 300g",
    "brand": "Green",
    "price": 2100,
    "market_price": 2820,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-ece0a408-579c-435e-b3ac-898f0169c5c3.jpg",
    "category": "Baby & Mom Care",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "22c723d4-7cee-458e-9b93-0d620043eedb",
    "name": "FOODAHOLIC Multi Sun Cream SPF50+PA+++ 250 ml",
    "brand": "Foodaholic",
    "price": 1640,
    "market_price": 1970,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-22c723d4-7cee-458e-9b93-0d620043eedb.jpg",
    "category": "Sunscreen",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "dcda7cdf-31ed-458e-b6d6-96190ceaa98b",
    "name": "GUERISSON 9 Complex Cream 70g",
    "brand": "GUERISSON",
    "price": 1650,
    "market_price": 2330,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-dcda7cdf-31ed-458e-b6d6-96190ceaa98b.jpg",
    "category": "Moisturizer & Cream",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "29d470b4-dd0d-4a84-bc7a-7fae43aa8ff8",
    "name": "Illiyoon Ceramide Ato Concentrate Cream 500ml",
    "brand": "Illiyoon",
    "price": 3500,
    "market_price": 5710,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-29d470b4-dd0d-4a84-bc7a-7fae43aa8ff8.jpg",
    "category": "Moisturizer & Cream",
    "rating": 0,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  }
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, brand, price, market_price, image, category, rating, reviews, isFeatured, featured_rank, stock, in_stock')
        .order('isFeatured', { ascending: false })
        .order('featured_rank', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (productsData && productsData.length > 0) {
        setFeaturedProducts(productsData as Product[]);
      }
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
    <div className="flex flex-col overflow-hidden bg-gtdark gt-neural-grid">
      <SEO
        title="Authentic Korean Skincare & Cosmetics Bangladesh"
        description="Shop 100% authentic Korean skincare, K-Beauty serums, cleansers, sunscreens & creams in Bangladesh. Try our AI Glow Predictor Studio at Glamour's Touch."
        url="/"
      />
      {/* Search & Hero Banner */}
      <HomeSearch />

      {/* Recommended Products Grid */}
      <section className="pt-2.5 pb-8 sm:py-16 relative overflow-hidden min-h-[480px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2.5 sm:mb-10">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gtgold" />
            <h2 className="text-xs md:text-sm font-black gt-gold-shiny tracking-[0.3em] uppercase font-display">Recommended for You</h2>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gtgold" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4 min-h-[320px]">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <div key={product.id}>
                  <ProductCard product={product} priority={idx < 2} />
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
              className="inline-flex items-center gap-2 bg-[#161d22]/90 border-2 border-gtgold text-white font-black px-8 py-3.5 rounded-full text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:bg-gtgold hover:text-charcoal hover:scale-105 transition-all"
            >
              সকল প্রোডাক্ট দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 sm:py-28 bg-transparent text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="gt-gold-shiny font-extrabold tracking-[0.4em] uppercase text-xs mb-3 block">{t('newsletter.subtitle')}</span>
            <h2 className="text-4xl md:text-6xl font-serif font-black mb-6 leading-tight text-white">
              এলিটদের <span className="gt-gold-shiny font-serif">সাথে যোগ দিন</span>
            </h2>
            <p className="text-gray-300 mb-10 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">{t('newsletter.description')}</p>
            
            {newsletterStatus === 'success' ? (
              <div className="bg-[#161d22]/90 border-2 border-gtgold p-6 rounded-3xl text-white font-bold tracking-widest uppercase">
                {t('newsletter.success')}
              </div>
            ) : (
              <form 
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 bg-[#161d22]/80 p-2 rounded-[3rem] border border-gtgold/50 backdrop-blur-md max-w-2xl mx-auto shadow-2xl"
              >
                <input 
                  required
                  type="email" 
                  name="email"
                  placeholder={t('newsletter.placeholder')} 
                  className="flex-grow bg-transparent border-none rounded-full px-6 py-4 focus:outline-none text-white placeholder:text-gray-400 font-medium text-sm"
                />
                <button 
                  disabled={newsletterStatus === 'loading'}
                  className="bg-[#161d22] border-2 border-gtgold hover:bg-gtgold hover:text-charcoal text-white px-8 py-4 rounded-full font-black tracking-[0.2em] text-xs transition-all duration-300 shadow-xl disabled:opacity-50 uppercase flex-shrink-0"
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
