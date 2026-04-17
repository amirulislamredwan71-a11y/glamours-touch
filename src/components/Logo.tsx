import React from 'react';
import { motion } from 'motion/react';

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Circle */}
      <div className="absolute inset-0 rounded-full bg-white shadow-sm" />
      
      {/* Outer Dotted Border */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-gold/40 border-dashed" 
      />
      
      {/* Main Solid Gold Border */}
      <div className="absolute inset-1 rounded-full border-2 border-gold shadow-inner" />
      
      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
        {/* Curved Text Simulation */}
        <div className="absolute top-1.5 text-[6px] xs:text-[7px] font-serif font-bold text-charcoal tracking-wider uppercase">
          GLAMOUR'S
        </div>
        <div className="absolute top-3.5 text-[5px] xs:text-[6px] font-serif font-bold text-gold tracking-widest uppercase">
          TOUCH
        </div>

        {/* Central Lipstick Icon */}
        <div className="flex flex-col items-center mt-1">
          {/* Lipstick cap (Slanted pink part) */}
          <div 
            className="w-2.5 h-4 bg-gradient-to-tr from-pink-600 to-pink-400 rounded-t-sm shadow-sm" 
            style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 100%)' }}
          />
          {/* Lipstick base (Gold tube) */}
          <div className="w-3.5 h-3 bg-gradient-to-b from-gold via-white/50 to-gold rounded-sm border border-gold/30 shadow-md" />
        </div>

        {/* Bottom Small Text */}
        <div className="absolute bottom-1.5 text-[4px] font-bold text-gray-400 tracking-tighter uppercase whitespace-nowrap">
          BEST COSMETICS
        </div>

        {/* Floating Stars */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-gold rounded-full animate-pulse shadow-[0_0_5px_gold]" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-gold rounded-full animate-pulse delay-700 shadow-[0_0_5px_gold]" />
      </div>
    </div>
  );
};

export default Logo;
