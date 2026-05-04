import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import {
  Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw,
  Share2, Facebook, MessageCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string; name: string; brand: string; price: number;
  image: string; category: string; rating: number;
  reviews: number; isFeatured: boolean; description: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [shared,   setShared]   = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct(data);

          // Dynamic SEO
          document.title = `${data.name} — Glamour's Touch`;
          const plainDesc = data.description?.replace(/<[^>]*>/g, '').slice(0, 120) ?? '';
          const setMeta = (sel: string, attr: string, val: string) => {
            let el = document.querySelector<HTMLMetaElement>(sel);
            if (!el) { el = document.createElement('meta'); if (attr === 'name') el.name = val; else el.setAttribute('property', val); document.head.appendChild(el); return; }
            el.content = val;
          };
          setMeta('meta[name="description"]', 'name', `${data.brand} ${data.name} — ৳${data.price.toLocaleString()}. ${plainDesc}`);

          // Open Graph tags for Facebook sharing
          const pageUrl = `${window.location.origin}/product/${data.id}`;
          setMeta('meta[property="og:title"]',       'property', `${data.name} — Glamour's Touch`);
          setMeta('meta[property="og:description"]', 'property', `${data.brand} · ৳${data.price.toLocaleString()}. ${plainDesc}`);
          setMeta('meta[property="og:image"]',       'property', data.image);
          setMeta('meta[property="og:url"]',         'property', pageUrl);
          setMeta('meta[property="og:type"]',        'property', 'product');
          setMeta('meta[property="product:price:amount"]',   'property', String(data.price));
          setMeta('meta[property="product:price:currency"]', 'property', 'BDT');

          // Facebook Pixel — ViewContent
          if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'ViewContent', {
              content_ids:  [data.id],
              content_name: data.name,
              content_type: 'product',
              value:        data.price,
              currency:     'BDT',
            });
          }

          // Related products
          const { data: rel } = await supabase.from('products').select('*')
            .eq('category', data.category).neq('id', data.id).limit(4);
          if (rel) setRelated(rel);

        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (id) fetchProduct();
    return () => { document.title = "Glamour's Touch | Premium Cosmetics & Skincare"; };
  }, [id]);

  const shareUrl  = window.location.href;
  const shareText = product ? `${product.name} - ৳${product.price.toLocaleString()} | Glamour's Touch` : '';

  const shareOnFacebook  = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareOnWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  const copyLink         = () => { navigator.clipboard.writeText(shareUrl); setShared(true); setTimeout(() => setShared(false), 2000); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-gold font-bold hover:underline">BACK TO SHOP</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-8">
          <ArrowLeft size={20} /><span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gold/10 aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-gold font-bold uppercase tracking-[0.2em] mb-2">{product.brand}</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} / 5.0 ({product.reviews} reviews)</span>
              </div>

              <p className="text-3xl font-serif font-bold text-charcoal mb-6">৳{product.price.toLocaleString()}</p>
              <div 
                className="prose prose-sm text-gray-600 mb-8 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={() => {
                    addToCart(product);
                    if (typeof (window as any).fbq === 'function') {
                      (window as any).fbq('track', 'AddToCart', {
                        content_ids:  [product.id],
                        content_name: product.name,
                        content_type: 'product',
                        value:        product.price,
                        currency:     'BDT',
                      });
                    }
                  }}
                  className="flex-grow bg-yellow-400 text-gray-900 py-5 rounded-full font-bold tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-lg">
                  <ShoppingBag size={20} /> ADD TO BAG
                </button>
                <button onClick={() => { clearCart(); addToCart(product); navigate('/checkout'); }}
                  className="flex-grow bg-orange-400 text-white py-5 rounded-full font-bold tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-lg">
                  BUY NOW
                </button>
              </div>

              {/* ── Social Share ── */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Share2 size={14} /> Share:
                </span>
                <button onClick={shareOnFacebook}
                  className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
                  <Facebook size={16} />
                </button>
                <button onClick={shareOnWhatsApp}
                  className="w-9 h-9 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
                  <MessageCircle size={16} />
                </button>
                <button onClick={copyLink}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                    ${shared ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gold hover:text-gold'}`}>
                  {shared ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 border-t border-gold/10 pt-8">
                {[
                  { icon: ShieldCheck, label: 'Authentic' },
                  { icon: Truck,       label: 'Fast Delivery' },
                  { icon: RefreshCw,   label: 'Easy Returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <Icon size={24} className="text-gold mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordion */}
            <div className="space-y-4">
              {[
                { title: 'How to Use', body: 'Apply a small amount to clean, dry skin. Massage gently in circular motions until fully absorbed. For best results, use twice daily.' },
                { title: 'Ingredients', body: 'Aqua, Glycerin, Saffron Extract, Sandalwood Oil, Vitamin E, Hyaluronic Acid, Aloe Vera Leaf Juice, Organic Turmeric, Natural Preservatives.' },
              ].map(acc => (
                <details key={acc.title} className="group border-b border-gold/10 pb-4">
                  <summary className="flex justify-between items-center cursor-pointer list-none font-serif font-bold text-lg">
                    {acc.title}
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">{acc.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="mb-8">
              <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs block mb-1">You May Also Like</span>
              <h2 className="text-3xl font-serif font-bold text-charcoal">Related <span className="text-gold italic">Products</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
