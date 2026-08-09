import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, Flame } from 'lucide-react';
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

  // Star rating display
  const rating = product.rating ?? 4.5;
  const fullStars  = Math.floor(rating);
  const hasHalf    = rating - fullStars >= 0.5;

  return (
    <motion.div
      className="group bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Low stock badge */}
      {stockLeft !== null && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md"
        >
          <Flame size={9} className="fill-white" />
          মাত্র {stockLeft}টি বাকি!
        </motion.div>
      )}

      {/* Discount / Sold-out badge */}
      {soldOut ? (
        <div className="absolute top-2 left-2 z-10 bg-gray-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md tracking-wide">
          SOLD OUT
        </div>
      ) : hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md">
          -{discountPct}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 p-2 sm:p-4">
        <Link to={`/product/${product.id}`} className="block h-full">
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
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link to={`/product/${product.id}`} className="block group-hover:text-gold transition-colors">
            <h3 className="text-[11px] sm:text-[13px] font-medium text-gray-900 line-clamp-1 mb-0.5 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={9}
                className={
                  i < fullStars
                    ? 'fill-yellow-400 text-yellow-400'
                    : i === fullStars && hasHalf
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'fill-gray-200 text-gray-300'
                }
              />
            ))}
            {(product.reviews ?? 0) > 0 && (
              <span className="text-[9px] text-gray-400 ml-0.5">({product.reviews})</span>
            )}
          </div>

          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0 mb-1.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through leading-none">
                ৳{marketPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 mt-auto">
          {soldOut ? (
            <button disabled
              className="flex-1 bg-gray-200 text-gray-500 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter cursor-not-allowed">
              Sold Out
            </button>
          ) : (
            <>
              <button
                onClick={fireAddToCart}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-1.5 rounded-lg text-[9px] font-bold transition-colors shadow-sm uppercase tracking-tighter"
              >
                Add
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg text-[9px] font-bold transition-colors shadow-sm uppercase tracking-tighter"
              >
                Buy
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
