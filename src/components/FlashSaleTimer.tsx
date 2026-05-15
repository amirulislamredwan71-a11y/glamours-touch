import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Tag } from 'lucide-react';

const FlashSaleTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [prevTime, setPrevTime] = useState({ hours: -1, minutes: -1, seconds: -1 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours   = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setPrevTime(t => ({ ...t }));
      setTimeLeft({ hours, minutes, seconds });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const TimeBox = ({ value, label, changed }: { value: string; label: string; changed: boolean }) => (
    <div className="flex flex-col items-center">
      <div className="relative bg-white/20 backdrop-blur-sm rounded-xl w-12 sm:w-16 h-10 sm:h-14 flex items-center justify-center overflow-hidden border border-white/30">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: changed ? -30 : 0, opacity: changed ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-white font-black text-xl sm:text-3xl font-mono leading-none absolute"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-white/70 text-[9px] sm:text-[10px] mt-1 font-medium">{label}</span>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 relative overflow-hidden"
    >
      {/* background sparkle pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">

          {/* Left — label */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
            >
              <Zap size={22} className="text-yellow-300 fill-yellow-300" />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-yellow-300 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Flash Sale
                </span>
                <Tag size={11} className="text-white/60" />
                <span className="text-white/80 text-[10px]">আজ রাত পর্যন্ত</span>
              </div>
              <p className="text-white font-bold text-sm sm:text-base leading-tight mt-0.5">
                সীমিত সময়ের Special Offer!
              </p>
            </div>
          </div>

          {/* Center — countdown */}
          <div className="flex items-end gap-1.5 sm:gap-2">
            <TimeBox value={pad(timeLeft.hours)}   label="ঘণ্টা"   changed={timeLeft.hours !== prevTime.hours} />
            <span className="text-white font-black text-2xl sm:text-3xl mb-3 leading-none">:</span>
            <TimeBox value={pad(timeLeft.minutes)} label="মিনিট"  changed={timeLeft.minutes !== prevTime.minutes} />
            <span className="text-white font-black text-2xl sm:text-3xl mb-3 leading-none">:</span>
            <TimeBox value={pad(timeLeft.seconds)} label="সেকেন্ড" changed={timeLeft.seconds !== prevTime.seconds} />
          </div>

          {/* Right — CTA */}
          <Link
            to="/shop"
            className="group flex items-center gap-1.5 bg-white text-red-600 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-lg hover:bg-yellow-300 hover:text-red-700 transition-all duration-300 whitespace-nowrap"
          >
            <Zap size={13} className="fill-current" />
            এখনই Shop করুন
          </Link>

        </div>
      </div>
    </motion.section>
  );
};

export default FlashSaleTimer;
