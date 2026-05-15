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

// Deterministic "stock" based on product id — looks real, always consistent
const getStockHint = (id: string): number | null => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  const bucket = Math.abs(hash) % 10;
  if (bucket < 3) return (Math.abs(hash) % 4) + 2; // 2-5 left (30%)
  return null; // no warning (70%)
};

const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const stockLeft = getStockHint(product.id);

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
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
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

          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-[10px] sm:text-[12px] text-gray-400 font-medium">৳</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-1 mt-auto">
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
