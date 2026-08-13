import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Sparkles, ShoppingBag, Heart, Share2, Eye, Zap, Shirt } from 'lucide-react';
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
    <div className="group bg-[#0b0e11] border border-gtgold/30 hover:border-gtgold/60 rounded-3xl flex flex-col h-full relative overflow-hidden transition-all duration-300 shadow-2xl backdrop-blur-md">
      {/* Top Image Container (Crisp White Box) */}
      <div className="relative m-2.5 rounded-2xl overflow-hidden bg-white aspect-square flex items-center justify-center p-3 shadow-inner">
        {/* Discount / Sold-out overlay */}
        {soldOut ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-gray-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider uppercase">
            SOLD OUT
          </div>
        ) : hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-[#ff1a6c] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          aria-label="wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-gtgold/30 hover:border-gtgold transition-all"
        >
          <Heart size={14} className={wished ? 'fill-[#ff1a6c] text-[#ff1a6c]' : 'text-white/80'} />
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
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${soldOut ? 'opacity-50 grayscale' : ''}`}
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="px-3.5 pb-3.5 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug mb-0.5 hover:text-gtgold transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Brand Store Tag (Gold Accent) */}
          <div className="text-[10px] font-bold text-gtgold tracking-wider uppercase mb-2 flex items-center gap-1">
            <span>GLAMOUR'S TOUCH</span>
            <span className="text-gray-400 font-normal">(গ্ল্যামারস টাচ)</span>
          </div>

          {/* Price & Status Badge */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="text-lg sm:text-xl font-extrabold text-gtgold">৳{product.price.toLocaleString()}</span>
            
            {/* Screenshot status badge style */}
            {hasDiscount ? (
              <span className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                ✓ ন্যায্য দাম
              </span>
            ) : (
              <span className="bg-amber-950/90 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                🔥 ভাইরাল আইটেম
              </span>
            )}
          </div>
        </div>

        {/* Dual Action Buttons Row (Screenshot spec: Gold Outline ADD + Solid Emerald BUY) */}
        {soldOut ? (
          <button disabled className="w-full bg-white/10 text-white/40 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tighter cursor-not-allowed mb-2.5">
            Sold Out
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button
              onClick={fireAddToCart}
              className="w-full bg-transparent border border-gtgold/50 hover:border-gtgold text-gtgold py-2.5 rounded-xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:bg-gtgold/10"
            >
              <ShoppingBag size={14} className="text-gtgold" />
              <span>ADD</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
            >
              <Zap size={14} className="fill-white text-white" />
              <span>BUY</span>
            </button>
          </div>
        )}

        {/* Bottom Utility Row (Screenshot spec: Share, Gold Eye / Glow Dekhun, Shiny TRY-ON) */}
        <div className="flex items-center justify-between pt-2 border-t border-gtgold/15">
          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              title="শেয়ার করুন"
              className="p-1.5 text-gray-400 hover:text-gtgold transition-colors rounded-full hover:bg-gtgold/10"
            >
              <Share2 size={15} />
            </button>

            {/* Glow Dekhun Eye Button */}
            <Link
              to={`/product/${product.id}`}
              title="Glow দেখুন (প্রোডাক্ট ডিটেইলস)"
              className="border border-gtgold/30 hover:border-gtgold text-gtgold px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight flex items-center gap-1 transition-all hover:bg-gtgold/10"
            >
              <Eye size={13} className="text-gtgold" />
              <span>Glow দেখুন</span>
            </Link>
          </div>

          {/* Right Floating Shiny TRY-ON Pill Button */}
          <Link
            to={`/glow-predictor?product=${product.id}`}
            className="gt-shiny text-charcoal px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-md hover:scale-105 transition-transform"
          >
            <Shirt size={11} className="text-charcoal" />
            <span>TRY-ON</span>
          </Link>
        </div>
      </div>
    </div>
  );

};

export default ProductCard;

