import React from 'react';
import { ShieldCheck, Wallet, RotateCcw, Plane } from 'lucide-react';

/** Honest risk-reversal band — kills the exact fears that block a cold visitor's first order.
 *  (No fabricated reviews — only true guarantees.) */
const PILLARS = [
  { icon: ShieldCheck, title: '১০০% অথেন্টিক', desc: 'নকল প্রমাণ হলে সম্পূর্ণ টাকা ফেরত।' },
  { icon: Wallet, title: 'ক্যাশ অন ডেলিভারি', desc: 'পণ্য হাতে পেয়ে টাকা দিন — আগে নয়।' },
  { icon: RotateCcw, title: 'সহজ রিটার্ন', desc: 'সমস্যা থাকলে দ্রুত রিটার্ন সুবিধা।' },
  { icon: Plane, title: 'সরাসরি কোরিয়া থেকে', desc: 'আসল K-beauty, দেশজুড়ে দ্রুত ডেলিভারি।' },
];

const TrustBand: React.FC = () => (
  <section className="bg-gthead py-8 sm:py-10">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gtgold/60" />
        <h2 className="text-xs sm:text-sm font-bold text-gtgoldsoft tracking-[0.3em] uppercase font-display">কেন Glamour's Touch</h2>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-gtgold/60" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {PILLARS.map((p) => (
          <div key={p.title} className="gt-card rounded-2xl p-4 text-center flex flex-col items-center">
            <span className="w-11 h-11 rounded-full gt-shiny flex items-center justify-center mb-2.5"><p.icon size={20} /></span>
            <p className="text-white font-bold text-sm leading-tight mb-1">{p.title}</p>
            <p className="text-white/55 text-[11px] leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBand;
