import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string; name: string; brand: string; price: number;
  image: string; category: string; rating: number;
  reviews: number; isFeatured: boolean; description: string;
}

const PAGE_SIZE = 20;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const urlSearchQuery = searchParams.get('search') || '';

  const [searchQuery,  setSearchQuery]  = useState(urlSearchQuery);
  const [sortBy,       setSortBy]       = useState('featured');
  const [allProducts,  setAllProducts]  = useState<Product[]>([]);
  const [categories,   setCategories]   = useState<string[]>(['All']);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);

  /* Price range */
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  const [rangeMax, setRangeMax] = useState(10000);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: catsData }     = await supabase.from('categories').select('name');
        if (productsData) {
          setAllProducts(productsData);
          const max = Math.max(...productsData.map(p => p.price), 10000);
          setRangeMax(max);
          setPriceMax(max);
        }
        if (catsData) setCategories(['All', ...catsData.map(c => c.name)]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => { setSearchQuery(urlSearchQuery); }, [urlSearchQuery]);
  useEffect(() => { setPage(1); }, [categoryFilter, searchQuery, sortBy, priceMin, priceMax]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    if (categoryFilter) products = products.filter(p => p.category === categoryFilter);
    if (searchQuery)    products = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    products = products.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (sortBy === 'price-low')  products.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') products.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     products.sort((a, b) => b.rating - a.rating);
    return products;
  }, [categoryFilter, searchQuery, sortBy, allProducts, priceMin, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-12 text-center md:text-left relative z-10">
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">The Collection</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-4 leading-tight">
            {categoryFilter ? categoryFilter : 'All Treasures'}
          </h1>
          <p className="text-lg font-light text-gray-500 max-w-2xl">
            Discover our curated selection of premium beauty products.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10 bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gold/10 relative z-10 space-y-5">

          {/* Category pills + Search + Sort */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-5">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {categories.map(cat => (
                <button key={cat}
                  onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 uppercase
                    ${(cat === 'All' && !categoryFilter) || categoryFilter === cat
                      ? 'bg-gold text-white shadow-md shadow-gold/20 scale-105'
                      : 'bg-white text-charcoal hover:bg-gold/10 border border-gold/10'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" size={16} />
                <input type="text" placeholder="Search…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 bg-white border border-gold/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all" />
              </div>
              <div className="relative w-full sm:w-auto">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-6 pr-12 py-3.5 bg-white border border-gold/10 rounded-full text-xs font-bold tracking-widest text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer uppercase">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white/70 rounded-2xl p-5 border border-gold/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={12} /> Price Range
              </span>
              <span className="text-sm font-bold text-gold">৳{priceMin.toLocaleString()} — ৳{priceMax.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full space-y-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest">Min</label>
                <input type="range" min={0} max={rangeMax} step={50}
                  value={priceMin}
                  onChange={e => { const v = Number(e.target.value); if (v <= priceMax) setPriceMin(v); }}
                  className="w-full h-1.5 rounded-full appearance-none bg-gold/20 accent-gold cursor-pointer" />
              </div>
              <div className="w-full space-y-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest">Max</label>
                <input type="range" min={0} max={rangeMax} step={50}
                  value={priceMax}
                  onChange={e => { const v = Number(e.target.value); if (v >= priceMin) setPriceMax(v); }}
                  className="w-full h-1.5 rounded-full appearance-none bg-gold/20 accent-gold cursor-pointer" />
              </div>
              <button onClick={() => { setPriceMin(0); setPriceMax(rangeMax); }}
                className="flex-shrink-0 text-xs text-gold font-bold hover:underline uppercase tracking-widest whitespace-nowrap">
                Reset
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-right">{filteredProducts.length} products found</p>
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {pageProducts.length > 0 ? (
            <motion.div key={`${categoryFilter}-${page}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {pageProducts.map((product, idx) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28 relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gold mx-auto mb-6 shadow-sm">
                <Search size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4">No treasures found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearchQuery(''); setPriceMin(0); setPriceMax(rangeMax); setSearchParams({}); }}
                className="bg-gold hover:bg-charcoal text-white px-10 py-4 rounded-full font-bold tracking-widest transition-all shadow-lg">
                CLEAR ALL FILTERS
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-14">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gold/20 hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all shadow-sm
                  ${n === page ? 'bg-gold text-white shadow-gold/30 shadow-md scale-110' : 'bg-white border border-gold/20 text-charcoal hover:bg-gold/10'}`}>
                {n}
              </button>
            ))}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gold/20 hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
