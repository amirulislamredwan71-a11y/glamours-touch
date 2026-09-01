import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const JoditEditor = lazy(() => import('jodit-react'));

const AdminProducts = () => {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading,   setUploading]   = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    market_price: '',
    description: '',
    image: '',
    category: 'Skincare',
    origin: 'International',
    rating: 5,
    reviews: 0,
    isFeatured: false,
    featured_rank: '' as string,
    images: [] as string[],
    in_stock: true,
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('name').order('name');
      if (data) setCategories(data.map(c => c.name));
    } catch (e) { console.error('Error fetching categories:', e); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Supabase Upload Error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
    } catch (error) {
      console.error('Error uploading main image:', error);
      const isNetworkError = error instanceof Error && error.message === 'Failed to fetch';
      alert(isNetworkError 
        ? 'Network Error: Failed to upload. Please check if your project is active and disable any Adblockers.'
        : 'Error uploading image. Please make sure you have a "products" bucket in your Supabase Storage.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `product-images/${crypto.randomUUID()}.${fileExt}`;
        const { error } = await supabase.storage.from('products').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
        urls.push(publicUrl);
      }
      setFormData(f => ({ ...f, images: [...(f.images || []), ...urls] }));
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('Error uploading gallery image(s).');
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error instanceof Error && error.message === 'Failed to fetch') {
        alert('Network Error: Cannot connect to Supabase. This usually happens if your project is PAUSED or if an Adblocker is blocking the connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        market_price: formData.market_price ? parseFloat(formData.market_price) : null,
        rating: parseFloat(formData.rating.toString()),
        reviews: parseInt(formData.reviews.toString()),
        stock: formData.stock !== '' && formData.stock != null ? parseInt(formData.stock.toString()) : null,
        featured_rank: formData.featured_rank !== '' && formData.featured_rank != null ? parseInt(formData.featured_rank.toString()) : null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please make sure the "products" table exists in your Supabase database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Quick rank change without opening the full edit modal -- this is the fast path for actually
  // curating homepage order across many products (opening the modal per product doesn't scale to
  // managing a "top 100" list). Optimistic local update + a direct PATCH; featured_rank of null/1
  // both mean "no rank set yet" so we always compute a real next number from what's on screen.
  const handleRankNudge = async (product: Product, direction: 'up' | 'down') => {
    const currentRank = product.featured_rank ?? (featuredOrdered.length + 1);
    const newRank = direction === 'up' ? Math.max(1, currentRank - 1) : currentRank + 1;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured_rank: newRank } : p));
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured_rank: newRank })
        .eq('id', product.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error nudging rank:', error);
      fetchProducts(); // roll back to real state on failure
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', brand: '', price: '', market_price: '',
      description: '', image: '',
      category: categories[0] || '',
      origin: 'International',
      rating: 5, reviews: 0, isFeatured: false, featured_rank: '',
      images: [], in_stock: true, stock: ''
    });
  };

  // The site's homepage shows featured products ordered by featured_rank (lowest first, unranked
  // last) -- this list mirrors that exact order so "reorder here" and "what shows on the homepage"
  // never drift apart.
  const featuredOrdered = products
    .filter(p => p.isFeatured)
    .sort((a, b) => {
      const ra = a.featured_rank ?? Infinity;
      const rb = b.featured_rank ?? Infinity;
      return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
    });

  const filteredProducts = (showFeaturedOnly ? featuredOrdered : products).filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">Products</h1>
          <p className="text-gray-500 mt-1">Manage your store's inventory and product details.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gold/20 hover:bg-charcoal transition-all"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
          />
        </div>
        <button
          onClick={() => setShowFeaturedOnly(v => !v)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${
            showFeaturedOnly
              ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter size={20} />
          {showFeaturedOnly ? `Featured (${featuredOrdered.length})` : 'Show Featured Only'}
        </button>
      </div>

      {showFeaturedOnly && (
        <p className="text-sm text-gray-500 -mt-2">
          এই লিস্টটাই homepage-এর "RECOMMENDED FOR YOU" order — উপরে থাকা প্রোডাক্ট আগে দেখায়। ↑/↓ দিয়ে সাজান।
        </p>
      )}

      {/* Mobile-Friendly Product Cards (Shown on mobile screens) */}
      <div className="block md:hidden space-y-4">
        {loading && products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-sm">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-gold font-bold uppercase">{product.brand || 'K-Beauty'}</p>
                  <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-charcoal">৳{product.price.toLocaleString()}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
                    product.isFeatured ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.isFeatured ? `#${product.featured_rank ?? '—'} Featured` : 'Standard'}
                  </span>
                  {product.isFeatured && (
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleRankNudge(product, 'up')} className="text-gray-400 hover:text-gold px-1">▲</button>
                      <button onClick={() => handleRankNudge(product, 'down')} className="text-gray-400 hover:text-gold px-1">▼</button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setFormData({
                        name: product.name,
                        brand: product.brand || '',
                        price: product.price.toString(),
                        market_price: product.market_price ? product.market_price.toString() : '',
                        description: product.description || '',
                        image: product.image,
                        category: product.category || categories[0] || '',
                        origin: product.origin || 'International',
                        rating: product.rating || 5,
                        reviews: product.reviews || 0,
                        isFeatured: product.isFeatured || false,
                        featured_rank: product.featured_rank != null ? product.featured_rank.toString() : '',
                        images: product.images || [],
                        in_stock: product.in_stock ?? true,
                        stock: product.stock != null ? product.stock.toString() : ''
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Products Table (Hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-charcoal">৳{product.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isFeatured ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                            #{product.featured_rank ?? '—'} Featured
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleRankNudge(product, 'up')}
                              title="উপরে সরান (আগে দেখাবে)"
                              className="text-gray-400 hover:text-gold leading-none px-1"
                            >▲</button>
                            <button
                              onClick={() => handleRankNudge(product, 'down')}
                              title="নিচে সরান (পরে দেখাবে)"
                              className="text-gray-400 hover:text-gold leading-none px-1"
                            >▼</button>
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setFormData({
                              name: product.name,
                              brand: product.brand || '',
                              price: product.price.toString(),
                              market_price: product.market_price ? product.market_price.toString() : '',
                              description: product.description || '',
                              image: product.image,
                              category: product.category || categories[0] || '',
                              origin: product.origin || 'International',
                              rating: product.rating || 5,
                              reviews: product.reviews || 0,
                              isFeatured: product.isFeatured || false,
                              images: product.images || [],
                              in_stock: product.in_stock ?? true,
                              stock: product.stock != null ? product.stock.toString() : ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-xl font-serif font-bold text-charcoal">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      placeholder="e.g. Saffron Glow Serum"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Brand</label>
                    <input 
                      required
                      type="text" 
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      placeholder="e.g. Glamour's Touch"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Price (৳)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">বাজার দাম / Market Price (৳)</label>
                    <input
                      type="number"
                      value={formData.market_price}
                      onChange={(e) => setFormData({...formData, market_price: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      placeholder="বাজার দাম (বেশি হলে কাটা-দাম + %OFF দেখাবে)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    >
                      {categories.length === 0 ? (
                        <option value="">Loading categories...</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      )}
                    </select>
                    {categories.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        ⚠️ No categories found. Please add categories first from the Categories page.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Origin</label>
                    <select 
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    >
                      <option>International</option>
                      <option>Local</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Product Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            required
                            type="url" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all text-sm"
                            placeholder="Or paste an image URL..."
                          />
                        </div>
                        <div className="relative">
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group">
                            <Upload size={18} className={uploading ? "animate-bounce text-gold" : "text-gray-400 group-hover:text-gold"} />
                            <span className="text-sm font-bold text-gray-700 group-hover:text-gold">
                              {uploading ? 'Uploading...' : 'Direct Image Upload'}
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="relative aspect-video bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center group">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={() => setFormData({...formData, image: ''})}
                                className="p-2 bg-red-500 text-white rounded-full shadow-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImageIcon size={40} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-400">Image Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Gallery — multiple view images */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">গ্যালারি / More View Images</label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {(formData.images || []).map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => setFormData(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center gap-1 w-20 h-20 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-all text-gray-500 hover:text-gold">
                        <Upload size={18} />
                        <span className="text-[9px] font-bold">Add</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploading} />
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">প্রোডাক্টে ক্লিক করার পর এই ছবিগুলো detail পেজে gallery হিসেবে দেখাবে।</p>
                  </div>

                  {/* In stock / Sold out toggle */}
                  <div className="md:col-span-2">
                    <button type="button"
                      onClick={() => setFormData(f => ({ ...f, in_stock: !f.in_stock }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full ${formData.in_stock ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                      <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all ${formData.in_stock ? 'bg-emerald-500 justify-end' : 'bg-red-400 justify-start'}`}>
                        <span className="w-5 h-5 bg-white rounded-full shadow" />
                      </span>
                      <span className="font-bold text-sm">{formData.in_stock ? 'In Stock ✓ (Available)' : 'Sold Out ✕ (Unavailable)'}</span>
                    </button>
                  </div>

                  {/* Real stock count — shows "মাত্র X টি বাকি" on the site when 1–10 pcs */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">স্টক / কত পিস বাকি (খালি রাখলে "বাকি" badge দেখাবে না)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="যেমন 5 — সাইটে দেখাবে: মাত্র 5টি বাকি!"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 min-h-[300px]">
                      <Suspense fallback={<div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">Editor লোড হচ্ছে...</div>}>
                        <JoditEditor
                          value={formData.description}
                          onBlur={(newContent) => setFormData({...formData, description: newContent})}
                          config={{
                            readonly: false,
                            height: 300,
                            placeholder: 'Describe the product benefits and ingredients...'
                          }}
                        />
                      </Suspense>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gold transition-all" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Feature this product on home page</span>
                    </label>
                    {formData.isFeatured && (
                      <div className="mt-3 flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Homepage Position</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="যত ছোট নম্বর, তত আগে দেখাবে"
                          value={formData.featured_rank}
                          onChange={(e) => setFormData({...formData, featured_rank: e.target.value})}
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                          className="w-40 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold placeholder:text-gray-400 placeholder:text-xs focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-grow px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-grow px-6 py-4 bg-gold text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-charcoal transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
