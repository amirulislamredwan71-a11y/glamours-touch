import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Globe, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('contact_messages').insert(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0c] text-white min-h-screen">
      <SEO
        title="যোগাযোগ করুন — Contact Us"
        description="Glamour's Touch এ যোগাযোগ করুন। 📞 01712-426871 | 💬 WhatsApp: +880 1712-426871 | Facebook: glamourstouch26। Korean skincare order এবং inquiry এর জন্য।"
        url="/contact"
      />

      {/* Hero Section (Pure Royal Dark Gradient - No generic stock images) */}
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0c] via-[#121418] to-[#0a0a0c] text-white border-b border-gtgold/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gtgold font-bold tracking-[0.3em] uppercase text-xs mb-3 block">Connect with Us</span>
            <h1 className="text-4xl md:text-6xl font-serif font-extrabold mb-5">Get in <span className="text-gtgold">Touch</span></h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto font-normal text-gray-300 leading-relaxed">
              আপনার যেকোনো স্কিনকেয়ার জিজ্ঞাসা, প্রোডাক্ট সম্পর্কিত তথ্য বা অর্ডারের জন্য আমাদের জানান। গ্ল্যামারস টাচ বিউটি টিম আপনার সহায়তায় ২৪/৭ নিয়োজিত।
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form Container (Ultra-luxurious 24K Dark Glass Form) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#121216]/90 border border-gtgold/30 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md"
            >
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-gtgold/20 text-gtgold rounded-full flex items-center justify-center mb-6 border border-gtgold/40">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-4">Message Sent!</h2>
                  <p className="text-gray-300 mb-8">ধন্যবাদ! আপনার বার্তাটি আমাদের টিমের কাছে সফলভাবে পৌঁছেছে। আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-gtgold font-bold hover:underline"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare size={24} className="text-gtgold" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Send us a <span className="text-gtgold">Message</span></h2>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gtgold/90 mb-2 uppercase tracking-widest">আপনার নাম *</label>
                        <input
                          required
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-[#1c1c22] text-white placeholder:text-gray-500 border border-gtgold/30 rounded-xl px-4 py-3.5 focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold font-medium transition-all text-sm"
                          placeholder="আপনার নাম লিখুন"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gtgold/90 mb-2 uppercase tracking-widest">ইমেইল এড্রেস</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-[#1c1c22] text-white placeholder:text-gray-500 border border-gtgold/30 rounded-xl px-4 py-3.5 focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold font-medium transition-all text-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gtgold/90 mb-2 uppercase tracking-widest">মোবাইল নম্বর <span className="text-red-400">*</span></label>
                      <input
                        required
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[#1c1c22] text-white placeholder:text-gray-500 border border-gtgold/30 rounded-xl px-4 py-3.5 focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold font-medium transition-all text-sm"
                        placeholder="01700-000000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gtgold/90 mb-2 uppercase tracking-widest">বিষয় (Subject)</label>
                      <input
                        required
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-[#1c1c22] text-white placeholder:text-gray-500 border border-gtgold/30 rounded-xl px-4 py-3.5 focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold font-medium transition-all text-sm"
                        placeholder="প্রোডাক্ট সম্পর্কে জানতে চাই..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gtgold/90 mb-2 uppercase tracking-widest">আপনার বার্তা (Message) *</label>
                      <textarea
                        required
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full bg-[#1c1c22] text-white placeholder:text-gray-500 border border-gtgold/30 rounded-xl px-4 py-3.5 focus:outline-none focus:border-gtgold focus:ring-1 focus:ring-gtgold font-medium transition-all text-sm resize-none"
                        placeholder="আপনার বিস্তারিত বার্তা এখানে লিখুন..."
                      ></textarea>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className="w-full gt-shiny text-black font-extrabold py-4 rounded-xl tracking-wider uppercase text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg hover:brightness-105"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          মেসেজ পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          পাঠিয়ে দিন <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-3">Contact <span className="text-gtgold">Information</span></h2>
                <p className="text-gray-300 text-sm">সরাসরি যোগাযোগের ঠিকানা ও কাস্টমার সার্ভিস চ্যানেলসমূহ:</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5 p-5 bg-[#141418] border border-gtgold/20 rounded-2xl group hover:border-gtgold/60 transition-all">
                  <div className="w-12 h-12 bg-gtgold/10 border border-gtgold/40 rounded-xl flex items-center justify-center text-gtgold group-hover:bg-gtgold group-hover:text-black transition-all flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Us</h4>
                    <a href="mailto:support@glamourstouch.com" className="text-base font-bold text-white hover:text-gtgold transition-colors">support@glamourstouch.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-5 bg-[#141418] border border-gtgold/20 rounded-2xl group hover:border-gtgold/60 transition-all">
                  <div className="w-12 h-12 bg-gtgold/10 border border-gtgold/40 rounded-xl flex items-center justify-center text-gtgold group-hover:bg-gtgold group-hover:text-black transition-all flex-shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Call / WhatsApp Us</h4>
                    <a href="tel:+8801712426871" className="text-base font-bold text-white hover:text-gtgold transition-colors">+880 1712-426871</a>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-5 bg-[#141418] border border-gtgold/20 rounded-2xl group hover:border-gtgold/60 transition-all">
                  <div className="w-12 h-12 bg-gtgold/10 border border-gtgold/40 rounded-xl flex items-center justify-center text-gtgold group-hover:bg-gtgold group-hover:text-black transition-all flex-shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Office Location</h4>
                    <p className="text-base font-bold text-white">Dhaka, Bangladesh, 1207</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Follow Glamour's Touch</h4>
                <div className="flex gap-4">
                  {[
                    { icon: <Facebook size={20} />, label: 'গ্ল্যামার্স টাচ', href: 'https://www.facebook.com/glamourstouch26' },
                    { icon: <Instagram size={20} />, label: '@glamourstouch.bd', href: 'https://www.instagram.com/glamourstouch.bd' },
                    { icon: <Globe size={20} />, label: 'glamourstouch.com', href: 'https://glamourstouch.com' },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target={social.href !== '#' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-[#141418] border border-gtgold/30 rounded-xl flex items-center justify-center text-gtgold hover:bg-gtgold hover:text-black transition-all transform hover:-translate-y-1 shadow-md"
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
