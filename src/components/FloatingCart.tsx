import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';

const FloatingCart = () => {
  const { cartCount, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[100]"
        >
          <Link to="/cart" className="block">
            <div className="flex flex-col overflow-hidden rounded-l-2xl shadow-2xl">
              {/* Top dark navy section */}
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="bg-[#1a1f3c] text-white px-3 py-2 flex flex-col items-center min-w-[58px]"
              >
                <ShoppingBag size={16} strokeWidth={2} />
                <span className="text-base font-extrabold leading-tight">{cartCount}</span>
                <span className="text-[8px] font-bold tracking-[0.2em] opacity-80">ITEMS</span>
              </motion.div>

              {/* Bottom hot-pink section */}
              <div className="bg-[#e91e8c] text-white px-2 py-1.5 text-center">
                <span className="text-[11px] font-bold tracking-wide">৳ {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCart;
