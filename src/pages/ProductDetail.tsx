import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { trackEvent } from '../lib/fbCapi';
import {
  Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw,
  Share2, Facebook, MessageCircle, Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';

import { optimizeImageUrl } from '../lib/imageUtils';

interface Product {
  id: string; name: string; brand: string; price: number;
  market_price?: number | null; images?: string[]; in_stock?: boolean;
  image: string; category: string; rating: number;
  reviews: number; isFeatured: boolean; description: string;
}

interface ReviewItem {
  id: string; customer_name: string; rating: number;
  comment: string | null; created_at: string;
}

const getProductCustomSEO = (productName: string, brand: string) => {
  const nameLower = productName.toLowerCase();
  const brandLower = (brand || '').toLowerCase();

  // A. Anua Heartleaf Pore Control Cleansing Oil
  if (nameLower.includes('anua') && nameLower.includes('cleansing oil')) {
    return {
      title: "Anua Heartleaf Pore Control Cleansing Oil — 100% Original Price in BD | Glamour's Touch",
      alt: "anua-cleansing-oil-price-in-bd-original",
      keywords: "anua cleansing oil price in bd, best korean cleansing oil for clogged pores bd, anua heartleaf cleansing oil original bangladesh"
    };
  }
  // B. Cosrx Advanced Snail 96 Mucin Power Essence
  if ((nameLower.includes('cosrx') || brandLower.includes('cosrx')) && nameLower.includes('snail') && nameLower.includes('mucin')) {
    return {
      title: "Cosrx Advanced Snail 96 Mucin Power Essence — 100% Original Price in BD | Glamour's Touch",
      alt: "cosrx-snail-mucin-essence-price-in-bd",
      keywords: "cosrx snail mucin essence price in bd, korean glass skin snail essence bangladesh, buy original cosrx snail mucin dhaka"
    };
  }
  // C. Medicube Collagen Night Wrapping Mask & Jelly Cream
  if ((nameLower.includes('medicube') || brandLower.includes('medicube')) && nameLower.includes('collagen')) {
    return {
      title: "Medicube Collagen Night Wrapping Mask — 100% Original Price in BD | Glamour's Touch",
      alt: "medicube-collagen-night-wrapping-mask-price-bd",
      keywords: "medicube collagen night wrapping mask price bd, medicube collagen jelly cream original bd, viral korean collagen mask bangladesh"
    };
  }
  // D. Beauty of Joseon Relief Sun (Rice + Probiotics / Aqua-Fresh)
  if ((nameLower.includes('joseon') || brandLower.includes('joseon') || nameLower.includes('relief sun')) && nameLower.includes('sun')) {
    return {
      title: "Beauty of Joseon Relief Sun Rice + Probiotics — 100% Original Price in BD | Glamour's Touch",
      alt: "beauty-of-joseon-sunscreen-price-in-bd",
      keywords: "beauty of joseon sunscreen price in bd, korean rice sunscreen original bangladesh, best non greasy korean sunscreen bd"
    };
  }
  // E. Anua Niacinamide 10% + TXA 4% Dark Spot Serum
  if (nameLower.includes('anua') && (nameLower.includes('niacinamide') || nameLower.includes('dark spot') || nameLower.includes('txa'))) {
    return {
      title: "Anua Niacinamide 10% + TXA 4% Dark Spot Serum — 100% Original Price in BD | Glamour's Touch",
      alt: "anua-dark-spot-serum-price-in-bd",
      keywords: "anua dark spot serum price in bd, niacinamide txa serum for hyperpigmentation bd, anua niacinamide serum bangladesh"
    };
  }
  // F. Christian Dean Secret Tone-Up Sun Cream
  if ((nameLower.includes('christian dean') || brandLower.includes('christian dean')) && (nameLower.includes('tone') || nameLower.includes('sun'))) {
    return {
      title: "Christian Dean Secret Tone Up Sun Cream — 100% Original Price in BD | Glamour's Touch",
      alt: "christian-dean-tone-up-sun-cream-price-in-bd",
      keywords: "christian dean tone up sun cream price in bd, christian dean sunscreen original bd"
    };
  }

  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    title: `${productName} — 100% Original Price in BD | Glamour's Touch`,
    alt: `${slug}-price-in-bd`,
    keywords: `${productName.toLowerCase()} price in bd, buy ${productName.toLowerCase()} bangladesh, authentic korean skincare`
  };
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [shared,   setShared]   = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', phone: '', rating: 5, comment: '' });

  // Admin-controlled free-delivery offer (site_settings.free_delivery = 'on'/'off'); default off
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'free_delivery').maybeSingle()
      .then(({ data }) => setFreeDelivery(data?.value === 'on'));
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct(data);

          const seoInfo = getProductCustomSEO(data.name, data.brand);

          // Dynamic SEO Meta Tags
          document.title = seoInfo.title;
          const plainDesc = data.description?.replace(/<[^>]*>/g, '').slice(0, 150) ?? '';
          const metaDesc = `Buy 100% authentic ${data.brand || 'Korean'} ${data.name} in Bangladesh at ৳${data.price.toLocaleString()}. 100% authentic guarantee with Cash on Delivery (COD) across BD.`;

          const setMeta = (sel: string, attr: string, val: string) => {
            let el = document.querySelector<HTMLMetaElement>(sel);
            if (!el) { el = document.createElement('meta'); if (attr === 'name') el.name = val; else el.setAttribute('property', val); document.head.appendChild(el); return; }
            el.content = val;
          };
          setMeta('meta[name="description"]', 'name', metaDesc);
          setMeta('meta[name="keywords"]', 'name', seoInfo.keywords);

          // Open Graph tags for Facebook & Social Sharing
          const pageUrl = `${window.location.origin}/product/${data.id}`;
          setMeta('meta[property="og:title"]',       'property', seoInfo.title);
          setMeta('meta[property="og:description"]', 'property', metaDesc);
          setMeta('meta[property="og:image"]',       'property', data.image);
          setMeta('meta[property="og:url"]',         'property', pageUrl);
          setMeta('meta[property="og:type"]',        'property', 'product');
          setMeta('meta[property="product:price:amount"]',   'property', String(data.price));
          setMeta('meta[property="product:price:currency"]', 'property', 'BDT');

          // Twitter Card
          setMeta('meta[name="twitter:card"]',        'name', 'summary_large_image');
          setMeta('meta[name="twitter:title"]',       'name', seoInfo.title);
          setMeta('meta[name="twitter:description"]', 'name', metaDesc);
          setMeta('meta[name="twitter:image"]',       'name', data.image);

          // Google Search Console Schema.org Product & Offer JSON-LD Structured Data
          let schemaEl = document.querySelector<HTMLScriptElement>('#product-json-ld');
          if (!schemaEl) {
            schemaEl = document.createElement('script');
            schemaEl.id = 'product-json-ld';
            schemaEl.type = 'application/ld+json';
            document.head.appendChild(schemaEl);
          }
          schemaEl.textContent = JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": data.name,
            "image": [data.image, ...(data.images || [])].filter(Boolean),
            "description": plainDesc || metaDesc,
            "sku": data.id,
            "brand": {
              "@type": "Brand",
              "name": data.brand || "Korean Authentic"
            },
            "offers": {
              "@type": "Offer",
              "url": pageUrl,
              "priceCurrency": "BDT",
              "price": String(data.price),
              "priceValidUntil": "2027-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": data.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Glamour's Touch"
              }
            },
            // Google's own guidelines: never include aggregateRating without real reviews behind it.
            // This product has none yet -- omit the block entirely rather than claim a fake rating.
            ...(data.reviews > 0 ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(data.rating),
                "reviewCount": String(data.reviews),
                "bestRating": "5",
                "worstRating": "1"
              }
            } : {})
          });

          // Facebook Pixel + Conversions API — ViewContent
          trackEvent('ViewContent', {
            content_ids:  [data.id],
            content_name: data.name,
            content_type: 'product',
            value:        data.price,
            currency:     'BDT',
          });

          // Related products
          const { data: rel } = await supabase.from('products').select('*')
            .eq('category', data.category).neq('id', data.id).limit(4);
          if (rel) setRelated(rel);

          // Explicit column list on purpose -- never select('*') here. customer_phone is only
          // ever readable by an admin session; the public view doesn't even have that column.
          const { data: revs } = await supabase
            .from('product_reviews_public')
            .select('id, customer_name, rating, comment, created_at')
            .eq('product_id', data.id)
            .order('created_at', { ascending: false });
          setReviewList(revs || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (id) fetchProduct();
    return () => {
      document.title = "Glamour's Touch | Authentic Korean Skincare & Cosmetics Bangladesh";
      const schemaEl = document.querySelector('#product-json-ld');
      if (schemaEl) schemaEl.remove();
    };
  }, [id]);

  const shareUrl  = window.location.href;
  const shareText = product ? `${product.name} - ৳${product.price.toLocaleString()} | Glamour's Touch` : '';

  const shareOnFacebook  = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareOnWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  const copyLink         = () => { navigator.clipboard.writeText(shareUrl); setShared(true); setTimeout(() => setShared(false), 2000); };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewSubmitting(true);
    try {
      // status is intentionally omitted -- a DB trigger forces every new review to 'pending'
      // no matter what's sent, so this insert can never self-publish.
      const { error } = await supabase.from('product_reviews').insert({
        product_id: product.id,
        customer_name: reviewForm.name.trim(),
        customer_phone: reviewForm.phone.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      });
      if (error) throw error;
      setReviewSubmitted(true);
      setShowReviewForm(false);
      setReviewForm({ name: '', phone: '', rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
      alert('Review জমা দেওয়া যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const gallery = [product.image, ...(product.images || [])].filter(Boolean);
  const soldOut = product.in_stock === false;
  const mp = product.market_price ?? null;
  const hasDiscount = mp != null && mp > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / mp) * 100) : 0;

  const seoCustomInfo = getProductCustomSEO(product.name, product.brand);

  return (
    <div className="min-h-screen bg-midnight-gold-dust text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-gtgold transition-colors mb-8">
          <ArrowLeft size={20} /><span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image gallery */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gtgold/40 aspect-square">
              <img src={optimizeImageUrl(gallery[activeImg] || product.image, 800, 85)} alt={`${product.brand ? `${product.brand} ` : ''}${product.name} - Glamour's Touch`}
                width="800" height="800" loading="eager" decoding="async" fetchpriority="high"
                className={`w-full h-full object-contain p-4 ${soldOut ? 'opacity-60 grayscale' : ''}`} referrerPolicy="no-referrer" />
              {soldOut ? (
                <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg tracking-widest">SOLD OUT</div>
              ) : hasDiscount && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#ff007f] to-[#ff2a85] text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg shadow-pink-500/40">-{discountPct}%</div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gtgold' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                    <img src={optimizeImageUrl(img, 160, 80)} alt={`${product.name} thumbnail ${i + 1} - Glamour's Touch`} width="80" height="80" loading="lazy" decoding="async" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="gt-gold-shiny font-extrabold uppercase tracking-[0.2em] mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-5xl font-serif font-black text-white mb-4 leading-tight">{product.name}</h1>

              {reviewList.length > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.round(reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {(reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length).toFixed(1)} / 5.0 ({reviewList.length} reviews)
                  </span>
                </div>
              )}
              <div className="flex items-baseline flex-wrap gap-3 mb-6">
                <p className="text-3xl md:text-5xl font-serif font-black gt-gold-shiny drop-shadow-md">৳{product.price.toLocaleString()}</p>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-white/60 font-bold line-through">৳{mp!.toLocaleString()}</span>
                    <span className="text-xs font-black text-white bg-gradient-to-r from-pink-600 to-rose-600 border border-pink-400/40 px-3 py-1 rounded-full shadow-lg shadow-pink-500/20">-{discountPct}% OFF</span>
                  </>
                )}
              </div>

              {/* ✨ AI Glow Predictor — GT's signature flagship feature */}
              <button type="button" onClick={() => setShowTryOn(true)}
                className="w-full mb-5 relative overflow-hidden bg-gradient-to-r from-gold via-amber-500 to-gold text-white py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">
                <Sparkles size={19} /> AI Glow Predictor — ২৮ দিন পর নিজের ত্বক দেখুন
                <span className="absolute top-1.5 right-2 text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full">NEW</span>
              </button>

              {/* Launch offer — admin-controlled via site_settings.free_delivery */}
              {freeDelivery && (
              <div className="flex items-center gap-2.5 mb-6 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-xl px-4 py-3">
                <span className="text-xl">🎁</span>
                <p className="text-sm font-bold text-amber-300 leading-snug">
                  এই সপ্তাহে <span className="text-gtgold font-black">ফ্রি হোম ডেলিভারি</span> — ক্যাশ অন ডেলিভারি, হাতে পেয়ে টাকা দিন!
                </p>
              </div>
              )}

              {/* Internal pricing notes ("Minimum Retail Selling Price...") got seeded into this
                  field for most of the catalog instead of a real description -- never show that
                  to a customer, it reads like a leaked internal number. */}
              {product.description && !/minimum\s+retail\s+selling\s+price/i.test(product.description) && (
                <div
                  className="prose prose-invert prose-sm text-white/80 mb-8 max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {soldOut ? (
                  <button disabled className="w-full bg-gray-700 text-white/50 py-4 rounded-full font-black tracking-widest text-sm uppercase">SOLD OUT</button>
                ) : (
                  <>
                    <button onClick={() => addToCart(product)} className="flex-1 bg-[#161d22] border-2 border-gtgold text-white hover:bg-gtgold hover:text-black py-4 rounded-full font-black tracking-wider text-sm transition-all shadow-xl">
                      ADD TO BAG
                    </button>
                    <button onClick={() => { clearCart(); addToCart(product); navigate('/checkout'); }} className="flex-1 gt-shiny text-black py-4 rounded-full font-black tracking-wider text-sm transition-all shadow-xl hover:scale-[1.02]">
                      BUY NOW
                    </button>
                  </>
                )}
              </div>

              {!soldOut && (
                <a
                  href={`https://wa.me/8801712426871?text=${encodeURIComponent(`আমি ${product.name} (৳${product.price.toLocaleString()}) নিতে চাই। এটা কীভাবে অর্ডার করব?`)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => trackEvent('Contact', { content_name: product.name, content_type: 'whatsapp_order_click' })}
                  className="flex items-center justify-center gap-2 w-full mb-8 bg-[#25D366] hover:bg-[#1ebc59] text-white py-4 rounded-full font-black tracking-wide text-sm transition-all shadow-xl hover:scale-[1.01]"
                >
                  <MessageCircle size={20} /> WhatsApp-এ অর্ডার করুন
                </a>
              )}

              {showTryOn && product && <TryOnModal product={product} onClose={() => setShowTryOn(false)} />}

              {/* Trust badges — kill hesitation right beside the buy button */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center text-center gap-1.5 bg-[#161d22] border border-gtgold/30 rounded-xl py-3 px-1 shadow-md">
                  <ShieldCheck size={22} className="text-gtgold" />
                  <span className="text-[11px] font-extrabold text-white/90 leading-snug">১০০% আসল<br />অথেন্টিক</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 bg-[#161d22] border border-gtgold/30 rounded-xl py-3 px-1 shadow-md">
                  <Truck size={22} className="text-gtgold" />
                  <span className="text-[11px] font-extrabold text-white/90 leading-snug">ক্যাশ অন<br />ডেলিভারি</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 bg-[#161d22] border border-gtgold/30 rounded-xl py-3 px-1 shadow-md">
                  <RefreshCw size={22} className="text-gtgold" />
                  <span className="text-[11px] font-extrabold text-white/90 leading-snug">সহজ<br />রিটার্ন</span>
                </div>
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
                    <h3 className="inline font-serif font-bold text-lg">{acc.title}</h3>
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">{acc.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-16 pt-16 border-t border-gold/10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-white">
              Reviews{reviewList.length > 0 && ` (${reviewList.length})`}
            </h2>
            {!showReviewForm && !reviewSubmitted && (
              <button onClick={() => setShowReviewForm(true)}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#161d22] border-2 border-gtgold text-white hover:bg-gtgold hover:text-black transition-all">
                Write a Review
              </button>
            )}
          </div>

          {reviewSubmitted && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-8 text-emerald-300 text-sm">
              ধন্যবাদ! আপনার review জমা হয়েছে — verify করে খুব শীঘ্রই এখানে দেখানো হবে।
            </div>
          )}

          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-[#161d22] border border-gtgold/20 rounded-2xl p-6 mb-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="আপনার নাম"
                  className="px-4 py-3 bg-[#0d1216] border border-white/10 rounded-xl text-white placeholder:text-white/40 text-sm outline-none focus:border-gtgold" />
                <input required value={reviewForm.phone} onChange={e => setReviewForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="মোবাইল নম্বর (অর্ডারের সাথে মিলিয়ে verify করা হবে)"
                  className="px-4 py-3 bg-[#0d1216] border border-white/10 rounded-xl text-white placeholder:text-white/40 text-sm outline-none focus:border-gtgold" />
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} aria-label={`${n} star`}>
                    <Star size={26} className="text-gold" fill={n <= reviewForm.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="প্রোডাক্টটা কেমন লাগলো লিখুন (ঐচ্ছিক)" rows={3}
                className="w-full px-4 py-3 bg-[#0d1216] border border-white/10 rounded-xl text-white placeholder:text-white/40 text-sm outline-none focus:border-gtgold resize-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={reviewSubmitting}
                  className="px-6 py-3 rounded-full text-sm font-bold gt-shiny text-black disabled:opacity-50">
                  {reviewSubmitting ? 'জমা হচ্ছে...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 rounded-full text-sm font-bold text-white/60 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviewList.length > 0 && (
            <div className="grid gap-4">
              {reviewList.map(r => (
                <div key={r.id} className="bg-[#161d22] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{r.customer_name}</span>
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-400 leading-relaxed">{r.comment}</p>}
                  <p className="text-[11px] text-gray-600 mt-2">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
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
