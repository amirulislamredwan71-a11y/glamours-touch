import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Sparkles, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  // Real, admin-set stock — show low-stock urgency only when genuinely low (1–10 pcs)
  const stockLeft = (typeof product.stock === 'number' && product.stock > 0 && product.stock <= 10) ? product.stock : null;
  const marketPrice = product.market_price ?? null;
  const hasDiscount = marketPrice != null && marketPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / marketPrice) * 100) : 0;
  const soldOut = product.in_stock === false;

  const fireAddToCart = () => {
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
  };

  const handleBuyNow = () => {
    fireAddToCart();
    navigate('/checkout');
  };

  return (
    <motion.div className="group gt-card rounded-2xl flex flex-col h-full relative overflow-hidden">
      {/* Discount / Sold-out badge */}
      {soldOut ? (
        <div className="absolute top-2 left-2 z-10 bg-gray-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md tracking-wide">
          SOLD OUT
        </div>
      ) : hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-gtred text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
          -{discountPct}%
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
        aria-label="wishlist"
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10"
      >
        <Heart size={13} className={wished ? 'fill-gtred text-gtred' : 'text-white/70'} />
      </button>

      {/* Low stock badge */}
      {stockLeft !== null && !soldOut && (
        <div className="absolute top-10 left-2 z-10 flex items-center gap-0.5 bg-gtred/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
          <Flame size={9} className="fill-white" /> মাত্র {stockLeft}টি
        </div>
      )}

      {/* Image (kept on light panel so K-beauty photos read clean on the dark card) */}
      <div className="relative m-2 rounded-xl overflow-hidden bg-white aspect-square">
        <Link to={`/product/${product.id}`} className="block h-full p-2 sm:p-3">
          <img
            src={product.image.includes('unsplash.com') ? `${product.image}&w=300` : product.image}
            alt={product.name}
            width="400"
            height="400"
            loading={priority ? 'eager' : 'lazy'}
            fetchpriority={priority ? 'high' : undefined}
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${soldOut ? 'opacity-50 grayscale' : ''}`}
            referrerPolicy="no-referrer"
          />
        </Link>
        {!soldOut && (
          <button
            onClick={fireAddToCart}
            aria-label="add to cart"
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full gt-shiny flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ShoppingBag size={15} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-2.5 pb-2.5 flex flex-col flex-grow">
        <div className="flex-grow">
          <span className="text-[9px] font-bold tracking-widest uppercase text-gtgoldsoft">{product.brand || 'Korea'}</span>
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-[11px] sm:text-[13px] font-semibold text-white/90 line-clamp-1 leading-tight mb-1 hover:text-gtgold transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-baseline flex-wrap gap-x-1.5 mb-2">
            <span className="text-base sm:text-lg font-extrabold text-gtgold leading-none">৳{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-[11px] text-white/35 line-through leading-none">৳{marketPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        {soldOut ? (
          <button disabled className="w-full bg-white/10 text-white/40 py-2 rounded-lg text-[9px] font-bold uppercase tracking-tighter cursor-not-allowed">
            Sold Out
          </button>
        ) : (
          <div className="flex gap-1.5 mt-auto">
            <button onClick={handleBuyNow}
              className="flex-1 bg-transparent border border-gtgold/70 text-gtgold py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1 hover:bg-gtgold/10 transition-all">
              <ShoppingBag size={11} /> Buy
            </button>
            <Link to={`/glow-predictor?product=${product.id}`}
              className="flex-1 gt-shiny py-2 rounded-lg text-[10px] font-bold tracking-tight flex items-center justify-center gap-1 hover:brightness-105 transition-all">
              <Sparkles size={11} /> Glow দেখুন
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
