import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
    <SEO
      title="Privacy Policy — গোপনীয়তা নীতি"
      description="Glamour's Touch এর privacy policy। আপনার personal information কিভাবে সংগ্রহ ও ব্যবহার করা হয়। Korean skincare Bangladesh। glamourstouch.com"
      url="/privacy-policy"
    />
    <div className="pt-40 pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-[2.5rem] shadow-sm border border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-8">Privacy <span className="text-gold italic">Policy</span></h1>
          <div className="prose prose-gold max-w-none text-gray-600 space-y-6">
            <p className="text-lg">At Glamour's Touch, we are committed to protecting your privacy and ensuring your personal information is handled securely.</p>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Information We Collect</h2>
              <p>We collect personal information such as your name, email address, phone number, and shipping address when you place an order or sign up for our newsletter.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">How We Use Your Information</h2>
              <p>Your information is used to process your orders, communicate with you about your delivery, and send you exclusive offers and updates if you have opted in to our newsletter.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Data Security</h2>
              <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is stored securely and is only accessible by authorized personnel.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Third-Party Disclosure</h2>
              <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except for trusted third parties who assist us in operating our website and conducting our business.</p>
            </section>

            <section id="data-deletion">
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Data Deletion &amp; Your Rights</h2>
              <p>You have the right to access, correct, or permanently delete the personal data we hold about you at any time — including any information we receive when you contact us or interact with us through Facebook or Messenger.</p>
              <p className="mt-3">To request deletion of your data, email us at <a href="mailto:glamourstouch26@gmail.com" className="text-gold font-semibold underline">glamourstouch26@gmail.com</a> or message us on Facebook or WhatsApp with the subject <strong>&ldquo;Delete My Data&rdquo;</strong>, along with the name, email address, or phone number you used with us. After we verify your identity, we will permanently delete your personal data within 30 days, except where we are required to retain certain records to comply with the law.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
