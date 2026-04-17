import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: "Are your products 100% authentic?",
      answer: "Yes, absolutely. We source all our products directly from premium brands and authorized distributors in Bangladesh and India. We guarantee 100% authenticity for every item in our store."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we currently ship to selected countries. Shipping costs and delivery times are calculated at checkout based on your location."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is dispatched, you will receive a confirmation email or SMS with a tracking number and a link to track your package."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns for unopened and unused products within 7 days of delivery. Due to hygiene reasons, we cannot accept returns for opened or used cosmetic items."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team via email at glamourstouch26@gmail.com or by calling us at +880 1712-426871 during business hours."
    }
  ];

  return (
    <div className="pt-40 pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-[2.5rem] shadow-sm border border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-12 text-center">Frequently Asked <span className="text-gold italic">Questions</span></h1>
          
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gold/10 pb-6">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-xl font-serif font-bold text-charcoal group-hover:text-gold transition-colors">{faq.question}</span>
                  <div className="text-gold">
                    {openIndex === idx ? <Minus size={24} /> : <Plus size={24} />}
                  </div>
                </button>
                {openIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 text-gray-600 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
