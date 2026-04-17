import React from 'react';
import { motion } from 'motion/react';

const TermsOfService = () => {
  return (
    <div className="pt-40 pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-[2.5rem] shadow-sm border border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-8">Terms of <span className="text-gold italic">Service</span></h1>
          <div className="prose prose-gold max-w-none text-gray-600 space-y-6">
            <p className="text-lg">Welcome to Glamour's Touch. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.</p>
            
            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Use of the Website</h2>
              <p>You agree to use our website for lawful purposes only and in a manner that does not infringe the rights of others or restrict their use of the site.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Product Information</h2>
              <p>We make every effort to display the colors and details of our products as accurately as possible. However, we cannot guarantee that your device's display will accurately reflect the actual color of the products.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Pricing and Availability</h2>
              <p>All prices are listed in Bangladeshi Taka (৳) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Limitation of Liability</h2>
              <p>Glamour's Touch shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our products or website.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
