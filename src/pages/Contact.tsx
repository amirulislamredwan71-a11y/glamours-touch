import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Globe, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1920" 
            alt="Contact Hero" 
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
            <span className="text-gold font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Connect with Us</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Get in <span className="text-gold">Touch</span></h1>
            <p className="text-xl max-w-3xl mx-auto font-light text-gray-300 leading-relaxed">
              We're here to help you on your beauty journey. Whether you have a question about our products or just want to say hello, we'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-cream p-10 rounded-3xl shadow-sm"
            >
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal mb-4">Message Sent!</h2>
                  <p className="text-gray-500 mb-8">Thank you for reaching out. Our beauty experts will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-gold font-bold hover:underline"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-serif font-bold text-charcoal mb-8">Send us a <span className="text-gold">Message</span></h2>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Your Name</label>
                        <input
                          required
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-gold transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-gold transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Mobile Number <span className="text-red-500">*</span></label>
                      <input
                        required
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-gold transition-colors"
                        placeholder="+880 1700-000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Subject</label>
                      <input
                        required
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-gold transition-colors"
                        placeholder="Product Inquiry"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Message</label>
                      <textarea
                        required
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-gold transition-colors resize-none"
                        placeholder="How can we help you today?"
                      ></textarea>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      className="w-full bg-gold hover:bg-charcoal text-white py-5 rounded-xl font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          SENDING...
                        </>
                      ) : (
                        <>
                          SEND MESSAGE <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-8">Contact <span className="text-gold">Information</span></h2>
              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-cream rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold mb-1">Email Us</h4>
                    <p className="text-gray-500">glamourstouch26@gmail.com</p>
                    <p className="text-gray-400 text-sm">We respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-cream rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold mb-1">Call Us</h4>
                    <p className="text-gray-500">+880 1712-426871</p>
                    <p className="text-gray-400 text-sm">We respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-cream rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold mb-1">Visit Us</h4>
                    <p className="text-gray-500">Dhaka, Bangladesh, 1207</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-serif font-bold mb-6">Follow Our Journey</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: <Facebook />, label: 'গ্ল্যামার্স টাচ', href: 'https://facebook.com/glamourstouch' },
                      { icon: <Instagram />, label: 'Instagram', href: '#' },
                      { icon: <Globe />, label: 'glamourstouch.com', href: 'https://glamourstouch.com' },
                    ].map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target={social.href !== '#' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all transform hover:-translate-y-1"
                        title={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
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
