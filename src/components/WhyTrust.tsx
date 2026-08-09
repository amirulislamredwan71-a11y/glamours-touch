import React from 'react';
import { ShieldCheck, Truck, Zap, RefreshCw } from 'lucide-react';

/** Honest trust / social-proof band — true value props, no fabricated reviews. */
const ITEMS = [
  { icon: ShieldCheck, title: '১০০% অথেন্টিক', sub: 'সরাসরি কোরিয়া থেকে আসল পণ্য' },
  { icon: Truck, title: 'ক্যাশ অন ডেলিভারি', sub: 'হাতে পেয়ে টাকা দিন' },
  { icon: Zap, title: 'দ্রুত ডেলিভারি', sub: 'সারা বাংলাদেশে' },
  { icon: RefreshCw, title: 'সহজ রিটার্ন', sub: 'নিশ্চিন্তে অর্ডার করুন' },
];

const WhyTrust = () => (
  <section className="bg-white py-8 sm:py-12 border-y border-gold/10">
    <div className="max-w-6xl mx-auto px-4">
      <p className="text-center text-gold text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1">
        কেন Glamour's Touch
      </p>
      <h2 className="text-center text-lg sm:text-2xl font-serif font-bold text-charcoal mb-6 sm:mb-8">
        ৬০০+ অথেন্টিক Korean &amp; Beauty প্রোডাক্ট 🇰🇷
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title}
            className="flex flex-col items-center text-center gap-2 bg-gray-50 rounded-2xl px-3 py-5 sm:py-6 hover:shadow-md transition-shadow">
            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Icon size={22} />
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal leading-tight">{title}</span>
            <span className="text-[11px] sm:text-xs text-gray-500 leading-snug">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyTrust;
