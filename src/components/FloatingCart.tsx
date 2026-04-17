import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';

const FloatingCart = () => {
  const { cartCount } = useCart();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="fixed -right-2 top-1/2 -translate-y-1/2 z-[100] md:hidden"
      >
        <Link 
          to="/cart"
          className="relative flex items-center justify-center w-12 h-16 bg-gold text-white rounded-l-2xl shadow-[-10px_0_30px_rgba(212,175,55,0.3)] border-y border-l border-white/20 group overflow-visible"
        >
          {cartCount > 0 && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white/20 rounded-l-2xl -z-10"
            />
          )}
          
          <div className="flex flex-col items-center gap-1 -ml-1">
            <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tighter">BAG</span>
          </div>
          
          {/* Badge */}
          <div className="absolute -top-2 -left-2 min-w-[20px] h-[20px] bg-charcoal text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-white shadow-lg">
            {cartCount}
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart;
