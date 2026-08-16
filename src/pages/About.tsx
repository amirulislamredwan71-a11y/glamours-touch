import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Globe, Award, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="bg-[#0a0d11] text-white min-h-screen">
      <SEO
        title="আমাদের সম্পর্কে — About Us"
        description="Glamour's Touch হলো Bangladesh এর একটি trusted 100% authentic Korean skincare shop। আমাদের লক্ষ্য — সেরা K-Beauty প্রোডাক্টস আপনার দরগোড়ায় পৌঁছে দেওয়া।"
        url="/about"
      />

      {/* Hero Section — 100% Pure Lightweight Luxury Dark Gold Gradient (Zero Heavy Images) */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-[#06080b] via-[#12171c] to-[#0a0d11] text-white overflow-hidden border-b border-gtgold/25">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gtgold/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="gt-gold-shiny font-black tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 inline-block px-4 py-1.5 rounded-full bg-gtgold/10 border border-gtgold/30">
              OUR STORY • আমাদের গল্প
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
              The Essence of <span className="gt-gold-shiny">Glamour</span>
            </h1>
            <p className="text-base sm:text-xl max-w-3xl mx-auto font-medium text-gray-300 leading-relaxed drop-shadow-md">
              Glamour's Touch was born from a passion for authentic Korean beauty traditions and a commitment to modern scientific dermatological excellence in Bangladesh.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-black uppercase tracking-widest text-gtgold block mb-2">আমাদের ভিশন ও মিশন</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                Bridging Traditions with <span className="gt-gold-shiny">K-Beauty Innovation</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-sm sm:text-base font-medium">
                <p>
                  At Glamour's Touch, we believe that true skincare excellence comes from authentic, science-backed Korean formulations. Our journey began in the heart of Dhaka, driven by the vision to make 100% genuine, original K-Beauty cosmetics accessible to everyone in Bangladesh.
                </p>
                <p>
                  We source our products straight from certified Korean manufacturers, ensuring every bottle of serum, moisturizer, toner, and sunscreen carries guaranteed batch authenticity and safety approvals.
                </p>
                <p>
                  Our mission is simple: to provide high-performance, dermatologist-approved skincare that celebrates your natural skin glow while adhering to strict quality controls.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#12171c] border border-gtgold/30 flex items-center gap-3">
                  <Award size={24} className="text-gtgold shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white">১০০% অরিজিনাল</p>
                    <p className="text-[10px] text-gtgold/80">গারান্টিড কোরিয়ান ইম্পোর্ট</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#12171c] border border-gtgold/30 flex items-center gap-3">
                  <CheckCircle size={24} className="text-gtgold shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white">সারা দেশে ডেলিভারি</p>
                    <p className="text-[10px] text-gtgold/80">ক্যাশ অন ডেলিভারি সুবিধা</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[4/3] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-gtgold/40 relative bg-[#12171c]">
                <img 
                  src="/categories/skincare.webp" 
                  alt="Our Mission" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d11] via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute -bottom-6 -left-4 bg-[#141a20] border-2 border-gtgold p-6 rounded-2xl text-white shadow-2xl hidden md:block max-w-xs">
                <p className="text-lg font-serif italic text-gtgold">"Beauty is the confidence in your natural skin glow."</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#070a0e] border-t border-gtgold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Our Core <span className="gt-gold-shiny">Values</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm font-medium">The core principles that guide every decision and product we curate for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Sparkles className="text-gtgold" size={28} />, title: 'Authenticity', desc: '100% genuine ingredients directly imported from Korea.' },
              { icon: <ShieldCheck className="text-gtgold" size={28} />, title: 'Quality Assurance', desc: 'Rigorous batch code testing and dermatological safety.' },
              { icon: <Heart className="text-gtgold" size={28} />, title: 'Customer Care', desc: 'Personalized AI & Expert skincare recommendation support.' },
              { icon: <Globe className="text-gtgold" size={28} />, title: 'Global Standards', desc: 'Bringing world-class K-Beauty to every doorstep in BD.' },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#12171c] p-6 rounded-2xl border border-gtgold/30 hover:border-gtgold transition-all text-center group shadow-xl"
              >
                <div className="w-14 h-14 bg-gtgold/15 border border-gtgold/40 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
