import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative h-[45vh] sm:h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 5, ease: "linear" }}
              src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1200" 
              alt="Hero" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gold font-bold tracking-[0.4em] uppercase text-xs mb-6 block"
            >
              {t('hero.subtitle')}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-3xl xs:text-6xl md:text-9xl font-serif font-bold mb-4 md:mb-8 leading-tight tracking-tighter"
            >
              {t('hero.title').split(' ')[0]} <br />
              <span className="text-gold italic">{t('hero.title').split(' ')[1]}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-[11px] xs:text-base md:text-2xl max-w-2xl mb-6 md:mb-12 font-light tracking-wide text-gray-300 leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-wrap gap-3 md:gap-6"
            >
              <Link 
                to="/shop"
                className="group relative inline-block bg-gold text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold tracking-[0.2em] text-[10px] md:text-xs transition-all duration-500 overflow-hidden shadow-2xl shadow-gold/20 uppercase"
              >
                <span className="relative z-10">{t('hero.shopNow')}</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="absolute inset-0 flex items-center justify-center text-charcoal opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-bold tracking-[0.2em] text-xs z-20">{t('hero.shopNow')}</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator - Hidden on mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-4"
        >
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/50 vertical-text">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </section>

      {/* All Products Section */}
      <section className="py-12 sm:py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[10px] md:text-xs font-bold text-gold tracking-[0.3em] uppercase">Recommended for You</h2>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (idx % 5) * 0.05, duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">{t('categories.subtitle')}</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-charcoal">{t('categories.title').split(' ')[0]} <span className="text-gold italic">{t('categories.title').split(' ').slice(1).join(' ')}</span></h2>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                >
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
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 font-serif text-xl italic">Curating collections...</div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-charcoal text-cream relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920')] opacity-5 object-cover pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-gold font-bold tracking-[0.4em] uppercase text-xs mb-6 block">{t('newsletter.subtitle')}</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">{t('newsletter.title').split(' ')[0]} <span className="text-gold italic">{t('newsletter.title').split(' ').slice(1).join(' ')}</span></h2>
            <p className="text-gray-400 mb-12 text-xl font-light leading-relaxed max-w-2xl mx-auto">{t('newsletter.description')}</p>
            
            {newsletterStatus === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md border border-gold/20 p-8 rounded-[2rem] text-gold font-bold tracking-widest uppercase"
              >
                {t('newsletter.success')}
              </motion.div>
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
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
