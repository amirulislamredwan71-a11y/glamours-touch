import React from 'react';
import { motion } from 'motion/react';

const ShippingPolicy = () => {
  return (
    <div className="pt-40 pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-[2.5rem] shadow-sm border border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-8">Shipping <span className="text-gold italic">Policy</span></h1>
          <div className="prose prose-gold max-w-none text-gray-600 space-y-6">
            <p className="text-lg">At Glamour's Touch, we strive to deliver your premium beauty products as quickly and safely as possible.</p>
            
            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Domestic Shipping (Bangladesh)</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dhaka City:</strong> Delivery within 24-48 hours. Delivery charge: ৳80.</li>
                <li><strong>Outside Dhaka:</strong> Delivery within 3-5 business days. Delivery charge: ৳150.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">International Shipping</h2>
              <p>We currently offer international shipping to selected countries. Delivery times vary between 7-14 business days depending on the destination. Shipping costs are calculated at checkout based on weight and location.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Order Tracking</h2>
              <p>Once your order is dispatched, you will receive a confirmation email or SMS with a tracking number to monitor your delivery progress.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
