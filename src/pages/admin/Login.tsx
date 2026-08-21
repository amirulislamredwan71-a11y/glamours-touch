import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await adminLogin(email, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid admin credentials. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-charcoal text-gold rounded-3xl shadow-2xl mb-6 transform hover:rotate-6 transition-transform">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Admin Portal</h1>
          <p className="text-gray-500 font-medium">Please sign in to manage your store</p>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gold/10 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-[0.2em] mb-3">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-gray-900 font-bold placeholder:text-gray-400"
                  placeholder="admin@glamourstouch.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-[0.2em] mb-3">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-gray-900 font-bold placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-500 text-sm p-4 rounded-xl font-medium border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-charcoal text-white py-5 rounded-2xl font-bold tracking-[0.2em] hover:bg-gold transition-all shadow-xl shadow-charcoal/10 hover:shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  SIGN IN TO DASHBOARD
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Secure Administrative Access Only. 
          <br />
          Unauthorized attempts will be logged.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
