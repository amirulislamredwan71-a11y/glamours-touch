import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Sparkles, ShoppingBag, Heart, Share2, Zap } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full group relative">
      {/* 1. SEPARATE Floating Crisp White Image Card with GT Gold Frame */}
      <div className="relative rounded-[32px] overflow-hidden bg-white aspect-square flex items-center justify-center p-4 shadow-xl border-2 border-gtgold/40 group-hover:border-gtgold transition-all duration-300 group-hover:scale-[1.02]">
        {/* Discount / Sold-out badge (Cyberpunk Neon Pink) */}
        {soldOut ? (
          <div className="absolute top-3 left-3 z-10 bg-gray-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider uppercase">
            SOLD OUT
          </div>
        ) : hasDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#ff007f] to-[#ff2a85] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md shadow-pink-500/40 tracking-tight">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          aria-label="wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-gtgold/40 hover:border-gtgold transition-all"
        >
          <Heart size={14} className={wished ? 'fill-[#ff007f] text-[#ff007f]' : 'text-white'} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center">
          <img
            src={optimizeImageUrl(product.image, 280, 75)}
            alt={`${product.brand ? `${product.brand} ` : ''}${product.name} - Glamour's Touch`}
            width="280"
            height="280"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
            className={`w-full h-full object-contain transition-transform duration-300 ${soldOut ? 'opacity-50 grayscale' : ''}`}
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>

      {/* 2. SEPARATE Product Info & Buttons (Outside image card, floating directly on page background) */}
      <div className="mt-3 px-1 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Brand Name Tag */}
          <span className="text-[10px] font-black tracking-widest uppercase gt-gold-shiny block mb-0.5">
            {product.brand || 'K-Beauty'}
          </span>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug mb-1.5 hover:text-gtgold transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price Display (Premium Gold) */}
          <div className="flex items-baseline flex-wrap gap-x-2 mb-3">
            <span className="text-lg sm:text-xl font-black gt-gold-shiny leading-none">৳{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-white/40 line-through leading-none">৳{marketPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Dual Action Buttons (Separated Outline ADD + Gold Frame BUY) */}
        {soldOut ? (
          <button disabled className="w-full bg-white/10 text-white/40 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-tighter cursor-not-allowed mb-2">
            Sold Out
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={fireAddToCart}
              className="w-full bg-[#161d22]/90 border border-gtgold/60 hover:border-gtgold text-white py-2.5 rounded-2xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:bg-gtgold/10"
            >
              <ShoppingBag size={14} className="text-white" />
              <span className="text-white">ADD</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-[#161d22]/90 border-2 border-gtgold hover:border-gtgold text-white py-2.5 rounded-2xl text-xs font-extrabold tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:bg-gtgold/10"
            >
              <Zap size={14} className="fill-white text-white" />
              <span className="text-white">BUY</span>
            </button>
          </div>
        )}

        {/* Dark Ash Glow দেখুন Button with Premium Gold Icon & Text (Screenshot Spec) */}
        {!soldOut && (
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-[#161d22] border border-gtgold/60 hover:border-gtgold py-2.5 rounded-2xl text-xs font-extrabold tracking-tight flex items-center justify-center gap-1.5 transition-all shadow-md group/glow hover:bg-gtgold/10"
          >
            <Sparkles size={14} className="text-gtgold group-hover/glow:scale-110 transition-transform" />
            <span className="gt-gold-shiny">Glow দেখুন</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;




