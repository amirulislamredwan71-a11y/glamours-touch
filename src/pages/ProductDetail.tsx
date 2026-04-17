import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-gold font-bold hover:underline">BACK TO SHOP</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gold/10 aspect-square"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-gold font-bold uppercase tracking-[0.2em] mb-2">{product.brand}</p>
              <h1 className="text-5xl font-serif font-bold text-charcoal mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">{product.rating} / 5.0 ({product.reviews} reviews)</span>
              </div>

              <p className="text-3xl font-serif font-bold text-charcoal mb-8">৳{product.price.toLocaleString()}</p>
              
              <div className="prose prose-sm text-gray-600 mb-10">
                <p>{product.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-grow bg-yellow-400 text-gray-900 py-5 rounded-full font-bold tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <ShoppingBag size={20} />
                  ADD TO BAG
                </button>
                <button 
                  onClick={() => {
                    clearCart();
                    addToCart(product);
                    navigate('/checkout');
                  }}
                  className="flex-grow bg-orange-400 text-white py-5 rounded-full font-bold tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  BUY NOW
                </button>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gold/10 pt-10">
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck size={24} className="text-gold mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck size={24} className="text-gold mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RefreshCw size={24} className="text-gold mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <details className="group border-b border-gold/10 pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none font-serif font-bold text-lg">
                  How to Use
                  <span className="group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Apply a small amount to clean, dry skin. Massage gently in circular motions until fully absorbed. For best results, use twice daily as part of your morning and evening skincare routine.
                </p>
              </details>
              <details className="group border-b border-gold/10 pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none font-serif font-bold text-lg">
                  Ingredients
                  <span className="group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Aqua, Glycerin, Saffron Extract, Sandalwood Oil, Vitamin E, Hyaluronic Acid, Aloe Vera Leaf Juice, Organic Turmeric, Natural Preservatives.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
