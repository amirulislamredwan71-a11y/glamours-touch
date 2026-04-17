import React from 'react';
import { motion } from 'motion/react';

const ReturnsExchanges = () => {
  return (
    <div className="pt-40 pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-[2.5rem] shadow-sm border border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-8">Returns & <span className="text-gold italic">Exchanges</span></h1>
          <div className="prose prose-gold max-w-none text-gray-600 space-y-6">
            <p className="text-lg">We want you to be completely satisfied with your Glamour's Touch purchase. If for any reason you are not happy, we are here to help.</p>
            
            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Return Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items must be returned within 7 days of delivery.</li>
                <li>Products must be unopened, unused, and in their original packaging.</li>
                <li>Due to hygiene reasons, opened or used cosmetic products cannot be returned or exchanged.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">How to Initiate a Return</h2>
              <p>To start a return or exchange, please contact our customer support team at <span className="text-gold font-bold">glamourstouch26@gmail.com</span> with your order number and reason for return. We will provide you with further instructions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Refunds</h2>
              <p>Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within 7-10 business days.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnsExchanges;
