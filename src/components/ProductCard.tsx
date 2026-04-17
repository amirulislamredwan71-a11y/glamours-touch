import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = () => {
    clearCart();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <motion.div
      className="group bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white p-2 sm:p-4">
        <Link to={`/product/${product.id}`} className="block h-full">
          <img
            src={product.image.includes('unsplash.com') ? `${product.image}&w=300` : product.image}
            alt={product.name}
            loading="lazy"
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
          
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-[10px] sm:text-[12px] text-gray-400 font-medium">৳</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-1 mt-auto">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-1.5 rounded-lg text-[9px] font-bold transition-colors shadow-sm uppercase tracking-tighter"
          >
            Add
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-1.5 rounded-lg text-[9px] font-bold transition-colors shadow-sm uppercase tracking-tighter"
          >
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
