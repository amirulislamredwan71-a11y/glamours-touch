import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Chrome, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signInWithEmail } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    
    const { error } = await signInWithEmail(email);
    
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to send magic link');
    } else {
      setSent(true);
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gold transition-colors"
          >
            <X size={24} />
          </button>

          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-3">{t('login.title')}</h2>
              <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
            </div>

            {sent ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">{t('login.magicLinkSent')}</h3>
                <p className="text-gray-500 mb-8">{t('login.checkEmail')} <span className="font-bold text-charcoal">{email}</span></p>
                <button
                  onClick={() => setSent(false)}
                  className="text-gold font-bold text-sm hover:underline"
                >
                  {t('login.tryAnother')}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-medium px-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold hover:bg-charcoal text-white py-4 rounded-2xl font-bold tracking-widest transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {t('login.sendLink')}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-10 text-center text-[10px] text-gray-400 leading-relaxed">
              {t('login.terms')}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
