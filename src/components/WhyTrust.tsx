import React from 'react';
import { ShieldCheck, Truck, Zap, RefreshCw } from 'lucide-react';

/** Compact, swipeable trust strip — true value props, no fabricated reviews. */
const ITEMS = [
  { icon: ShieldCheck, title: '১০০% অথেন্টিক' },
  { icon: Truck, title: 'ক্যাশ অন ডেলিভারি' },
  { icon: Zap, title: 'দ্রুত ডেলিভারি' },
  { icon: RefreshCw, title: 'সহজ রিটার্ন' },
];

const WhyTrust = () => (
  <section className="bg-white py-3 border-y border-gold/10">
    <div className="max-w-6xl mx-auto px-4">
      <div
        className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {ITEMS.map(({ icon: Icon, title }) => (
          <div key={title}
            className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-full pl-2 pr-3.5 py-1.5 border border-gold/10">
            <span className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Icon size={15} />
            </span>
            <span className="text-xs font-bold text-charcoal whitespace-nowrap">{title}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyTrust;
