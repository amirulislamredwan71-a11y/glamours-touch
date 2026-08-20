import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Zap, Package, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || 'গুগল দিয়ে লগইন করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gold/30 p-8 sm:p-10 text-center"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gold hover:bg-gold/10 p-2 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Logo / Brand Header */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-gold/20 via-gold/10 to-transparent flex items-center justify-center border border-gold/40 shadow-inner">
            <Sparkles className="text-gold w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mb-2">
            Glamour's Touch
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-8 leading-relaxed">
            ১০০% অরিজিনাল কোরিয়ান স্কিনকেয়ার শপিং ও এক্সক্লুসিভ অফার পেতে গুগল দিয়ে ১-ট্যাপে প্রবেশ করুন।
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left">
              {error}
            </div>
          )}

          {/* Pure 1-Click Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-charcoal border-2 border-gray-200 hover:border-gold py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] group disabled:opacity-75 relative overflow-hidden"
          >
            {loading ? (
              <Loader2 className="animate-spin text-gold" size={22} />
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <span className="tracking-wide">গুগল দিয়ে সরাসরি লগইন করুন</span>
                <ArrowRight size={18} className="text-gold group-hover:translate-x-1 transition-transform ml-auto" />
              </>
            )}
          </button>

          {/* Benefits Feature List */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3 text-left">
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <Zap size={16} className="text-gold flex-shrink-0" />
              <span>পাসওয়ার্ড বা ইমেইল টাইপিংয়ের কোনো ঝামেলা নেই</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <Package size={16} className="text-gold flex-shrink-0" />
              <span>রিয়েল-টাইম অর্ডার ট্র্যাকিং ও দ্রুত ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
              <span>১০০% নিরাপদ ও এনক্রিপ্টেড গুগল সিকিউরিটি</span>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-[11px] text-gray-400">
            লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলী ও প্রাইভেসিতে সম্মত হচ্ছেন।
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
