import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const urlSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [sortBy, setSortBy] = useState('featured');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch All Products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (productsData) setAllProducts(productsData);

        // Fetch Categories for Filter
        const { data: catsData } = await supabase
          .from('categories')
          .select('name');
        
        if (catsData) {
          const catNames = ['All', ...catsData.map(c => c.name)];
          setCategories(catNames);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update local search query when URL param changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (categoryFilter) {
      products = products.filter(p => p.category === categoryFilter);
    }

    if (searchQuery) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    return products;
  }, [categoryFilter, searchQuery, sortBy, allProducts]);

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center md:text-left relative z-10"
        >
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">The Collection</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-6 leading-tight">
            {categoryFilter ? categoryFilter : 'All Treasures'}
          </h1>
          <p className="text-xl font-light text-gray-500 max-w-2xl leading-relaxed">
            Discover our curated selection of premium beauty products, ethically crafted to celebrate your unique glow.
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16 bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-gold/10 relative z-10"
        >
          {/* Categories */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
                className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-300 uppercase ${
                  (cat === 'All' && !categoryFilter) || categoryFilter === cat
                    ? 'bg-gold text-white shadow-lg shadow-gold/20 scale-105'
                    : 'bg-white text-charcoal hover:bg-gold/10 border border-gold/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold" size={18} />
              <input
                type="text"
                placeholder="Search treasures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-8 py-4 bg-white border border-gold/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 shadow-inner transition-all"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-8 pr-14 py-4 bg-white border border-gold/5 rounded-full text-sm font-bold tracking-widest text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer shadow-inner transition-all uppercase"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold pointer-events-none" size={16} />
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div 
              key={categoryFilter || 'all'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 relative z-10"
            >
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 relative z-10"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gold mx-auto mb-8 shadow-sm">
                <Search size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4">No treasures found</h3>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSearchParams({});}}
                className="bg-gold hover:bg-charcoal text-white px-10 py-4 rounded-full font-bold tracking-widest transition-all shadow-lg"
              >
                CLEAR ALL FILTERS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Shop;
