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
    "id": "74d48daa-7695-41f9-8f10-9e5fb4f0e2d9",
    "name": "AXIS-Y Dark Spot Correcting Glow Serum 50ml",
    "brand": "AXIS-Y",
    "price": 1380,
    "market_price": 1750,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-74d48daa-7695-41f9-8f10-9e5fb4f0e2d9.jpg",
    "category": "Serum & Treatment",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "752e606b-2d13-4573-b115-ec44812a8f1f",
    "name": "Beauty Of Joseon Relief Sun: Rice + Probiotics SPF 50+ PA++++ (50 ml)",
    "brand": "Beauty of Joseon",
    "price": 1600,
    "market_price": 2250,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/fd953fed-7df4-4d0a-8854-d8031183e09b.jpg",
    "category": "Sunscreen",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "b4dffc6f-e0cb-4808-9fbc-8ee4e6c67f6e",
    "name": "Cosrx Advanced Snail 96 Mucin Power Essence 100 ml",
    "brand": "Cosrx",
    "price": 1650,
    "market_price": 2250,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/66280e1c-71ea-43aa-9b4f-1789f7cf01c6.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "2cd26aca-dcb2-4498-aca3-2587c6570103",
    "name": "Anua Heartleaf 77% Soothing Toner 40 ml",
    "brand": "Anua",
    "price": 780,
    "market_price": 1150,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-2cd26aca-dcb2-4498-aca3-2587c6570103.jpg",
    "category": "Toner",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "47d7a44d-8cf9-48ef-89b8-bc9a64480514",
    "name": "SKIN1004 Madagascar Centella Ampoule 30 ml",
    "brand": "SKIN1004",
    "price": 890,
    "market_price": 1300,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-47d7a44d-8cf9-48ef-89b8-bc9a64480514.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "d234f3bd-06c1-47f2-9659-54b4f5f45391",
    "name": "Cosrx Low pH Good Morning Gel Cleanser 150 ml",
    "brand": "Cosrx",
    "price": 1050,
    "market_price": 1600,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-d234f3bd-06c1-47f2-9659-54b4f5f45391.jpg",
    "category": "Cleanser",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "8f20817d-2adf-4de3-9ea6-4bb1345e1475",
    "name": "Medicube Collagen Jelly Cream 110 ml",
    "brand": "Medicube",
    "price": 2650,
    "market_price": 3600,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/31ad7bb2-3f13-4480-98e5-e1caba27db6b.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "9fb5d24a-658b-4805-9711-eaf94ab53e7f",
    "name": "Beauty of Joseon Glow Serum Propolis + Niacinamide 30 ml",
    "brand": "Beauty of Joseon",
    "price": 1550,
    "market_price": 2150,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-9fb5d24a-658b-4805-9711-eaf94ab53e7f.jpg",
    "category": "Serum & Essence",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "d3b2fe21-6698-4f09-ab18-07bd9f005d2d",
    "name": "Dr.Althea 345 Relief Cream 50 ml",
    "brand": "Dr.Althea",
    "price": 2050,
    "market_price": 2750,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-d3b2fe21-6698-4f09-ab18-07bd9f005d2d.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "29d470b4-dd0d-4a84-bc7a-7fae43aa8ff8",
    "name": "Illiyoon Ceramide Ato Concentrate Cream 500ml",
    "brand": "Illiyoon",
    "price": 3600,
    "market_price": 5800,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-29d470b4-dd0d-4a84-bc7a-7fae43aa8ff8.jpg",
    "category": "Moisturizer & Cream",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "252d0e25-48c8-40c8-bb23-0515d7163a8d",
    "name": "Anua Heartleaf Pore Control Cleansing Oil 200 ml",
    "brand": "Anua",
    "price": 2200,
    "market_price": 3200,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-252d0e25-48c8-40c8-bb23-0515d7163a8d.jpg",
    "category": "Cleanser",
    "rating": 5,
    "reviews": 0,
    "isFeatured": true,
    "in_stock": true,
    "stock": 15
  },
  {
    "id": "2e87c032-9138-4e6c-8ea7-7843c51c5d6d",
    "name": "Beauty Of Joseon Ginseng + Retinal Revive Eye Serum 30ml",
    "brand": "Beauty of Joseon",
    "price": 1600,
    "market_price": 2200,
    "image": "https://fmcltrjnuvuooarkvufn.supabase.co/storage/v1/object/public/products/product-images/koba-2e87c032-9138-4e6c-8ea7-7843c51c5d6d.jpg",
    "category": "Eye Care",
    "rating": 5,
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

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Glamour's Touch",
      "url": "https://www.glamourstouch.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.glamourstouch.com/shop?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Glamour's Touch",
      "url": "https://www.glamourstouch.com",
      "logo": "https://www.glamourstouch.com/logo.png",
      "image": "https://www.glamourstouch.com/logo.png",
      "description": "Glamour's Touch হলো Bangladesh এর একটি premium Korean skincare shop। আমরা 100% authentic Korean beauty products বিক্রি করি।",
      "telephone": "+8801712426871",
      "priceRange": "$$",
      "currenciesAccepted": "BDT",
      "paymentAccepted": "Cash on Delivery, bKash, Nagad, Card",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BD",
        "addressLocality": "Dhaka",
        "addressRegion": "Dhaka"
      },
      "sameAs": [
        "https://www.facebook.com/glamourstouch26",
        "https://www.instagram.com/glamourstouch.bd"
      ]
    }
  ];

  return (
    <div className="flex flex-col overflow-hidden bg-gtdark gt-neural-grid">
      <SEO
        title="100% Authentic Korean Skincare & Cosmetics Bangladesh"
        description="Shop 100% authentic Korean skincare, K-Beauty serums, cleansers, sunscreens & creams in Bangladesh. Try our AI Glow Predictor Studio at Glamour's Touch."
        url="/"
        schema={homeSchemas}
      />
      {/* Search & Hero Banner */}
      <HomeSearch />

      {/* Recommended Products Grid */}
      <section className="pt-2.5 pb-8 sm:py-16 relative overflow-hidden min-h-[480px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2.5 sm:mb-10">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gtgold" />
            <h2 className="text-xs md:text-sm font-black gt-gold-shiny tracking-[0.25em] uppercase font-display text-center">
              TOP 100 BEST SELLERS • RECOMMENDED FOR YOU
            </h2>
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
