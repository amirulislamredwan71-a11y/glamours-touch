import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || 'গুগল দিয়ে লগইন করা সম্ভব হয়নি। ইমেইল ও পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials' 
            ? 'ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।' 
            : error.message || 'লগইন ব্যর্থ হয়েছে');
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          setError(error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
        } else {
          setSuccessMsg('🎉 একাউন্ট সফলভাবে তৈরি হয়েছে! আপনি এখন লগইন অবস্থায় আছেন।');
          setTimeout(() => onClose(), 1500);
        }
      } else if (mode === 'forgot') {
        const { error } = await (resetPassword ? resetPassword(email) : { error: null });
        if (error) {
          setError(error.message || 'পাসওয়ার্ড রিসেট লিংক পাঠানো সম্ভব হয়নি');
        } else {
          setSuccessMsg('✅ আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'একটি সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gold/20"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gold transition-colors z-10"
          >
            <X size={22} />
          </button>

          <div className="p-7 sm:p-9">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mb-1">
                {mode === 'signup' ? 'নতুন একাউন্ট তৈরি করুন' : mode === 'forgot' ? 'পাসওয়ার্ড রিসেট' : 'লগইন করুন'}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                {mode === 'signup' 
                  ? 'গ্ল্যামারস টাচে আপনাকে স্বাগতম' 
                  : mode === 'forgot' 
                  ? 'আপনার ইমেইল দিয়ে পাসওয়ার্ড রিসেট করুন' 
                  : 'আপনার একাউন্টে প্রবেশ করুন'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot' && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                >
                  লগইন
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                >
                  নতুন একাউন্ট
                </button>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="আপনার পুরো নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-xs sm:text-sm focus:border-gold focus:bg-white outline-none transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="ইমেইল এড্রেস"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-xs sm:text-sm focus:border-gold focus:bg-white outline-none transition-all"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    placeholder={mode === 'signup' ? 'পাসওয়ার্ড সেট করুন (কমপক্ষে ৬ অক্ষর)' : 'পাসওয়ার্ড'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-xs sm:text-sm focus:border-gold focus:bg-white outline-none transition-all"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                    className="text-[11px] text-gray-500 hover:text-gold font-medium transition-colors"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-charcoal py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {mode === 'signup' ? 'একাউন্ট তৈরি করুন' : mode === 'forgot' ? 'রিসেট লিংক পাঠান' : 'লগইন করুন'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className="w-full text-center text-xs text-gold font-bold hover:underline mt-3"
                >
                  লগইন পেজে ফিরে যান
                </button>
              )}
            </form>

            <p className="mt-6 text-center text-[10px] text-gray-400">
              নিরাপদ এনক্রিপশন ও ১০০% প্রাইভেসির সাথে সুরক্ষিত 🔒
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
