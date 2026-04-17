import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1920" 
            alt="About Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">The Essence of <span className="text-gold">Glamour</span></h1>
            <p className="text-xl max-w-3xl mx-auto font-light text-gray-300 leading-relaxed">
              Glamour's Touch was born from a passion for authentic beauty traditions and a commitment to modern scientific excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-serif font-bold text-charcoal mb-8">Bridging Traditions with <span className="text-gold">Innovation</span></h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p>
                  At Glamour's Touch, we believe that beauty is a bridge between the wisdom of the past and the possibilities of the future. Our journey began in the heart of Dhaka, inspired by the rich heritage of Bangladeshi and Indian beauty rituals that have been passed down through generations.
                </p>
                <p>
                  We've spent years researching the most potent natural ingredients from our region—from the soothing properties of turmeric to the rejuvenating essence of sandalwood—and combining them with cutting-edge dermatological science.
                </p>
                <p>
                  Our mission is simple: to provide you with ethically crafted, high-performance cosmetics that celebrate your natural glow while adhering to the highest global standards of quality and safety.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000" 
                  alt="Our Mission" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-gold p-8 rounded-2xl text-white hidden md:block">
                <p className="text-3xl font-serif font-bold italic">"Beauty is the light in the heart."</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">Our Core <span className="text-gold">Values</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The principles that guide every product we create and every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Sparkles />, title: 'Authenticity', desc: 'Real ingredients, real results, and a commitment to our cultural roots.' },
              { icon: <ShieldCheck />, title: 'Quality', desc: 'Rigorous testing and premium sourcing for every single item.' },
              { icon: <Heart />, title: 'Ethical', desc: 'Cruelty-free practices and sustainable sourcing for a better world.' },
              { icon: <Globe />, title: 'Inclusivity', desc: 'Beauty for every skin tone, every age, and every unique individual.' },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
