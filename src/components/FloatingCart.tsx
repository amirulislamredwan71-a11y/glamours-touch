import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const FloatingCart: React.FC = () => {
  const { cartCount, cartTotal } = useCart();

  if (cartCount <= 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] transition-all duration-300 transform translate-x-0">
      <Link to="/cart" className="block group">
        <div className="flex flex-col overflow-hidden rounded-l-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105">
          {/* Top dark navy section */}
          <div className="bg-[#1a1f3c] text-white px-3 py-2 flex flex-col items-center min-w-[58px]">
            <ShoppingBag size={16} strokeWidth={2} />
            <span className="text-base font-extrabold leading-tight">{cartCount}</span>
            <span className="text-[8px] font-bold tracking-[0.2em] opacity-80">ITEMS</span>
          </div>

          {/* Bottom hot-pink section */}
          <div className="bg-[#d21b7e] text-white px-2 py-1.5 text-center">
            <span className="text-[11px] font-bold tracking-wide">৳ {cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCart;
