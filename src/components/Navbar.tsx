import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LogOut, Globe, ShieldCheck, Mic, Camera, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import Logo from './Logo';
import SkinScanModal from './SkinScanModal';

/* Each nav item gets its own accent colour */
const NAV_COLORS = [
  { bg: 'bg-pink-500',   ring: 'ring-pink-400',   text: 'text-pink-500',   light: 'bg-pink-50'   },
  { bg: 'bg-violet-500', ring: 'ring-violet-400',  text: 'text-violet-500', light: 'bg-violet-50' },
  { bg: 'bg-emerald-500',ring: 'ring-emerald-400', text: 'text-emerald-500',light: 'bg-emerald-50'},
];

const ROTATING_PLACEHOLDERS = [
  'Medicube Collagen Jelly Cream • ৳২,১৯০',
  'Anua Heartleaf 77% Toner • ৳১,৬৫০',
  'Beauty of Joseon Relief Sun • ৳১,১৯০',
  'COSRX 96 Snail Essence • ৳১,৬৪০',
  'DABO Black Snail Retinal • ৳১,১৪০',
  'SKIN1004 Centella Cleansing Oil • ৳২,০৭০',
  'K-Secret Seoul 1988 Essence • ৳২,০৭০',
];

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { openLogin } = useUI();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [isMenuOpen,   setIsMenuOpen]   = React.useState(false);
  const [searchQuery,  setSearchQuery]  = React.useState('');
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);
  const [scanOpen,     setScanOpen]     = React.useState(false);
  const [listening,    setListening]    = React.useState(false);
  const { t, i18n } = useTranslation();

  /* Rotate top product placeholders every 3.5 seconds */
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে ভয়েস সার্চ সাপোর্ট করে না।');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setListening(false);
      navigate(`/shop?search=${encodeURIComponent(transcript)}`);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const navItems = [
    { name: t('nav.home'),    path: '/' },
    { name: t('nav.shop'),    path: '/shop' },
    { name: 'Blog',           path: '/blog' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070709]/95 backdrop-blur-xl border-b border-gtgold/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24 gap-2">

          {/* Mobile hamburger */}
          <div className="flex md:hidden flex-shrink-0">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-white/80 hover:text-gtgold transition-all duration-300">
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* Logo (Clean GT emblem only, NO text to save full width for Search Bar) */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group flex items-center">
              <Logo className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>

          {/* Top Integrated Gold Search Bar (Takes Maximum Space) */}
          <div className="flex-1 max-w-2xl mx-1.5 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-gtgold pointer-events-none z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                aria-label="Search top products"
                className="w-full bg-[#12161a] border border-gtgold/60 focus:border-gtgold rounded-full pl-10 pr-20 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-gtgold/70 shadow-lg focus:outline-none focus:ring-1 focus:ring-gtgold transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}
                  className="absolute right-16 text-white/50 hover:text-white">
                  <X size={15} />
                </button>
              )}
              <div className="absolute right-1.5 flex items-center gap-1 z-10">
                {/* Voice Mic Button */}
                <button type="button" onClick={startVoiceSearch} title="ভয়েস সার্চ করুন"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1a2128] border border-gtgold/40 text-gtgold flex items-center justify-center shadow-md active:scale-90 transition-all ${listening ? 'animate-pulse bg-gtgold/20' : ''}`}>
                  <Mic size={14} />
                </button>
                {/* Camera AI Scan Button */}
                <button type="button" onClick={() => setScanOpen(true)} title="AI Skin Scan — মুখ স্ক্যান করুন"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1a2128] border border-gtgold/40 text-gtgold flex items-center justify-center shadow-md active:scale-90 transition-all">
                  <Camera size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* ── Right Action Items (Clean 1-line EN/BN toggle & User Icon) ── */}
          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
            {/* Language Toggle in single line */}
            <button onClick={toggleLanguage}
              className="flex items-center gap-1 text-gtgold hover:text-white transition-all group px-2 py-1 bg-[#141b20] border border-gtgold/30 rounded-full text-[10px] font-extrabold tracking-wider whitespace-nowrap">
              <Globe size={14} className="group-hover:rotate-12 transition-transform" />
              <span>{i18n.language === 'en' ? 'বা' : 'EN'}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-gold hover:text-white transition-all group" title="Admin">
                    <ShieldCheck size={20} />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center text-white/80 hover:text-gtgold transition-all">
                  <User size={19} />
                </Link>
              </div>
            ) : (
              <button onClick={openLogin}
                className="hidden md:block text-[10px] font-bold tracking-[0.2em] bg-charcoal text-white hover:bg-gold transition-all px-3 py-1.5 rounded-full shadow-lg uppercase whitespace-nowrap">
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      </div>


      {/* ── Mobile Menu ── */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/97 backdrop-blur-2xl border-b border-gold/10 overflow-hidden"
          >
            <div className="px-5 py-5 space-y-5">
              {/* Compact nav grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {navItems.map((item, idx) => {
                  const col = NAV_COLORS[idx % NAV_COLORS.length];
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all active:scale-[0.97]
                        ${active ? `${col.light} ${col.text} border-transparent ring-1 ${col.ring}` : 'bg-gray-50 text-charcoal border-gray-100'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${col.bg} flex-shrink-0`} />
                      <span className="text-sm font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gold/10 space-y-3">
                <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full text-charcoal font-bold tracking-widest py-3 bg-gray-50 rounded-2xl">
                  <Globe size={18} />
                  {i18n.language === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
                </button>

                {!user ? (
                  <button onClick={() => { openLogin(); setIsMenuOpen(false); }}
                    className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold tracking-widest uppercase shadow-xl flex items-center justify-center gap-3">
                    <User size={20} /> {t('nav.signIn')}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-3 w-full bg-charcoal text-white py-4 rounded-2xl font-bold tracking-widest uppercase">
                      <User size={20} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-3 w-full bg-gold/10 text-gold py-4 rounded-2xl font-bold tracking-widest uppercase">
                        <ShieldCheck size={20} /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold tracking-widest uppercase">
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    <SkinScanModal isOpen={scanOpen} onClose={() => setScanOpen(false)} />
    </>
  );
};

export default Navbar;
