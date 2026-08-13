import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Sparkles, ShoppingBag, Heart, Share2, Eye, Zap, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { trackEvent } from '../lib/fbCapi';
import { optimizeImageUrl } from '../lib/imageUtils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const stockLeft = (typeof product.stock === 'number' && product.stock > 0 && product.stock <= 10) ? product.stock : null;
  const marketPrice = product.market_price ?? null;
  const hasDiscount = marketPrice != null && marketPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / marketPrice) * 100) : 0;
  const soldOut = product.in_stock === false;

  const fireAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product);
    trackEvent('AddToCart', {
      content_ids:  [product.id],
      content_name: product.name,
      content_type: 'product',
      value:        product.price,
      currency:     'BDT',
    });
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    fireAddToCart();
    navigate('/checkout');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.origin + `/product/${product.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
      alert('প্রোডাক্ট লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <div className="flex flex-col h-full group relative">
      {/* 1. SEPARATE Floating Image Card with Gold Frame Accent (Screenshot & GT Spec) */}
      <div className="relative rounded-[32px] overflow-hidden bg-white aspect-square flex items-center justify-center p-4 shadow-xl border-2 border-gtgold/40 group-hover:border-gtgold transition-all duration-300 group-hover:scale-[1.02]">
        {/* Verified Gold Badge */}
        <div className="absolute top-3 left-3 z-10 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
          <CheckCircle2 size={11} className="text-amber-400 fill-amber-400/30" /> VERIFIED
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          aria-label="wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-gtgold/40 hover:border-gtgold transition-all"
        >
          <Heart size={14} className={wished ? 'fill-[#ff1a6c] text-[#ff1a6c]' : 'text-white'} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center">
          <img
            src={optimizeImageUrl(product.image, 400, 80)}
            alt={`${product.brand ? `${product.brand} ` : ''}${product.name} - Glamour's Touch`}
            width="400"
            height="400"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
            className={`w-full h-full object-contain transition-transform duration-300 ${soldOut ? 'opacity-50 grayscale' : ''}`}
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>

      {/* 2. SEPARATE Product Info & Buttons (Outside image card, floating directly on background) */}
      <div className="mt-3 px-1 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug mb-0.5 hover:text-gtgold transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / GT Store Tag (Original GT Gold Accent) */}
          <div className="text-[10px] font-bold text-gtgold tracking-wider uppercase mb-2 flex items-center gap-1">
            <span>GLAMOUR'S TOUCH</span>
            <span className="text-gray-400 font-normal">(গ্ল্যামারস টাচ)</span>
          </div>

          {/* Price & Status Badge */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="text-lg sm:text-xl font-extrabold text-gtgold">৳{product.price.toLocaleString()}</span>
            
            {hasDiscount ? (
              <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                ✓ ন্যায্য দাম
              </span>
            ) : (
              <span className="bg-amber-950/80 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                🔥 সেরা দাম
              </span>
            )}
          </div>
        </div>

        {/* Dual Action Buttons (Screenshot spec: Separated Gold Outline ADD + Solid Emerald BUY) */}
        {soldOut ? (
          <button disabled className="w-full bg-white/10 text-white/40 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-tighter cursor-not-allowed mb-2.5">
            Sold Out
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button
              onClick={fireAddToCart}
              className="w-full bg-[#161d22]/90 border border-gtgold/50 hover:border-gtgold text-gtgold py-2.5 rounded-2xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:bg-gtgold/10"
            >
              <ShoppingBag size={14} className="text-gtgold" />
              <span>ADD</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-2xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-900/50"
            >
              <Zap size={14} className="fill-white text-white" />
              <span>BUY</span>
            </button>
          </div>
        )}

        {/* Utility Row (Screenshot spec: Share & Eye Icon only — Try-On Removed as requested) */}
        <div className="flex items-center justify-start gap-4 pt-1 text-gray-400">
          <button onClick={handleShare} title="শেয়ার করুন" className="hover:text-gtgold transition-colors flex items-center gap-1 text-xs">
            <Share2 size={16} />
          </button>
          <Link to={`/product/${product.id}`} title="Glow দেখুন" className="hover:text-gtgold transition-colors flex items-center gap-1 text-xs">
            <Eye size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



