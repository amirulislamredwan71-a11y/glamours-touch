import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
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

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterStatus, setNewsletterStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Featured Products - Showing all products in the recommended section
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsData) setFeaturedProducts(productsData);

      // Fetch Categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
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
    <div className="flex flex-col overflow-hidden">
      <SEO
        title="Korean Skincare & Beauty Products Bangladesh"
        description="Glamour's Touch — Bangladesh এর সেরা Korean skincare shop। DABO Snail Cream, Rice Ceramide, Glutathione Cream সহ 100% authentic Korean beauty products। Order: 01712-426871"
        url="/"
      />
      {/* Hero Section */}
      <section className="relative w-full bg-charcoal overflow-hidden pt-16 sm:pt-20">
        <div className="relative w-full">
          <img 
            src="/hero-banner.webp"
            alt="Glamour's Touch"
            width="1280"
            height="533"
            className="w-full h-auto block"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
           {/* SHOP NOW button aligned to image text */}
           <div className="absolute inset-0">
             <Link
               to="/shop"
               className="absolute bottom-[11%] left-[45%] -translate-x-1/2 inline-flex items-center gap-1.5 sm:gap-3 bg-charcoal/90 hover:bg-gold text-gold hover:text-white px-3 py-1.5 sm:px-8 sm:py-4 rounded-full font-bold tracking-[0.15em] text-[8px] sm:text-xs uppercase border border-gold/20 transition-all duration-300"
             >
               SHOP NOW
               <ArrowRight size={10} className="sm:hidden" />
               <ArrowRight size={18} className="hidden sm:block" />
             </Link>
           </div>

        </div>
      </section>
      
      {/* Flash Sale Countdown */}
      <FlashSaleTimer />

      {/* All Products Section */}
      <section className="py-12 sm:py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8 md:mb-12">
            <div className="animate-fade-in-up">
              <h2 className="text-[10px] md:text-xs font-bold text-gold tracking-[0.3em] uppercase">Recommended for You</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <div key={product.id}>
                  <ProductCard product={product} priority={idx < 2} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400">Loading treasures...</div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="animate-fade-in-up">
              <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">{t('categories.subtitle')}</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-charcoal">{t('categories.title').split(' ')[0]} <span className="text-gold italic">{t('categories.title').split(' ').slice(1).join(' ')}</span></h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <div key={cat.id} className="animate-fade-in-up">
                  <Link 
                    to={`/shop?category=${cat.name}`}
                    className="group relative h-[550px] overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 block"
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-700" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-8 text-center">
                      <h3 className="text-white text-4xl font-serif font-bold tracking-wider mb-4 transform group-hover:-translate-y-4 transition-transform duration-700">{cat.name}</h3>
                      <div className="w-12 h-[1px] bg-gold mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                      <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700">{t('categories.discover')}</span>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 font-serif text-xl italic">Curating collections...</div>
            )}
          </div>
        </div>
      </section>

      {/* Facebook Post */}
      <section className="py-20 bg-cream">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Follow Us</span>
          <h2 className="text-3xl font-serif font-bold text-charcoal mb-10">
            আমাদের <span className="text-gold italic">Facebook</span> পোস্ট
          </h2>
          <div className="flex justify-center">
            <iframe
              src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0KFEdesuqJ384jXoHCeCttwzg1RXmHic8tq3vgkCqieCNE1pdT4ovECs8WL4XhxMrl%26id%3D61574369240231&show_text=true&width=500"
              width="500"
              height="404"
              style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
              scrolling="no"
              frameBorder={0}
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-charcoal text-cream relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920')] opacity-5 object-cover pointer-events-none" />
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
