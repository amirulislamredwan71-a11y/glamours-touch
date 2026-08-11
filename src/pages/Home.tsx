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
        .order('isFeatured', { ascending: false })
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
    <div className="flex flex-col overflow-hidden bg-gtdark">
      <SEO
        title="Korean Skincare & Beauty Products Bangladesh"
        description="Glamour's Touch — Bangladesh এর সেরা Korean skincare shop। DABO Snail Cream, Rice Ceramide, Glutathione Cream সহ 100% authentic Korean beauty products। Order: 01712-426871"
        url="/"
      />
      {/* Search-first hero (replaces static banner) */}
      <HomeSearch />

      {/* All Products Section */}
      <FlashBanner />

      {/* NOTE: no trust/"why us" band here — it duplicates the compact trust strip under the
          search bar (HomeSearch). This was built & removed twice; do NOT re-add. */}

      <section className="py-10 sm:py-16 bg-gtdark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-10">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gtgold/60" />
            <h2 className="text-xs md:text-sm font-bold text-gtgoldsoft tracking-[0.3em] uppercase font-display">Recommended for You</h2>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gtgold/60" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <div key={product.id}>
                  <ProductCard product={product} priority={idx < 2} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-white/40">Loading treasures...</div>
            )}
          </div>
        </div>
      </section>

      {/* Categories now live as swipeable chips in the search hero above */}

      {/* Facebook Post */}
      <section className="py-16 bg-gthead">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-gtgoldsoft font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Follow Us</span>
          <h2 className="text-3xl font-serif font-bold text-white mb-10">
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
