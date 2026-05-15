import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

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

  const TimeBox = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl w-9 sm:w-16 h-7 sm:h-14 flex items-center justify-center overflow-hidden border border-white/30">
        <span className="text-white font-black text-sm sm:text-3xl font-mono leading-none">
          {value}
        </span>
      </div>
      <span className="text-white/70 text-[7px] sm:text-[10px] mt-0.5 sm:mt-1 font-medium">{label}</span>
    </div>
  );

  return (
    <section className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 relative overflow-hidden animate-flash-sale">
      {/* background sparkle pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-4">
        <div className="flex flex-row items-center justify-center sm:justify-between gap-1 sm:gap-6">

          {/* Left — label */}
          <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:block rotate-zap">
              <Zap size={22} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="bg-yellow-300 text-red-700 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Flash Sale
                </span>
                <span className="text-white/80 text-[8px] sm:text-[10px] hidden sm:inline">আজ রাত পর্যন্ত</span>
              </div>
              <p className="text-white font-bold text-[10px] sm:text-base leading-tight mt-0.5 hidden sm:block">
                সীমিত সময়ের Special Offer!
              </p>
            </div>
          </div>

          {/* Center — countdown */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            <TimeBox value={pad(timeLeft.hours)}   label="ঘণ্টা"   changed={timeLeft.hours !== prevTime.hours} />
            <span className="text-white font-black text-base sm:text-3xl mb-0 sm:mb-3 leading-none">:</span>
            <TimeBox value={pad(timeLeft.minutes)} label="মিনিট"  changed={timeLeft.minutes !== prevTime.minutes} />
            <span className="text-white font-black text-base sm:text-3xl mb-0 sm:mb-3 leading-none">:</span>
            <TimeBox value={pad(timeLeft.seconds)} label="সেকেন্ড" changed={timeLeft.seconds !== prevTime.seconds} />
          </div>

          {/* Right — CTA */}
          <Link
            to="/shop"
            className="group flex items-center gap-1 bg-white text-red-600 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-black text-[9px] sm:text-xs shadow-lg hover:bg-yellow-300 hover:text-red-700 transition-all duration-300 whitespace-nowrap"
          >
            <Zap size={11} className="fill-current sm:hidden" />
            <Zap size={13} className="fill-current hidden sm:block" />
            এখনই Shop করুন
          </Link>

        </div>
      </div>
    </section>
  );
};

export default FlashSaleTimer;
