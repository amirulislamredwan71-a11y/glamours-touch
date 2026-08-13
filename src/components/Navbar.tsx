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
        <div className="flex justify-between items-center h-20 md:h-24 gap-2 lg:gap-4">

          {/* Left Group: Hamburger + Logo + Desktop Nav Links */}
          <div className="flex items-center gap-2 lg:gap-5 flex-shrink-0">
            {/* Hamburger Menu Button (Three line icon) */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
              className="p-1.5 text-white/80 hover:text-gtgold transition-all duration-300">
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Logo */}
            <Link to="/" className="group flex items-center">
              <Logo className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
            </Link>

            {/* Desktop Navigation Links (Visible on Laptop/PC screens from md: breakpoint) */}
            <div className="hidden md:flex items-center gap-3 lg:gap-5 text-xs lg:text-sm font-extrabold tracking-wide">
              <Link to="/" className={`hover:text-gtgold transition-colors ${isActive('/') ? 'gt-gold-shiny' : 'text-white/90'}`}>
                {t('nav.home')}
              </Link>
              <Link to="/shop" className={`hover:text-gtgold transition-colors ${isActive('/shop') ? 'gt-gold-shiny' : 'text-white/90'}`}>
                {t('nav.shop')}
              </Link>
              <Link to="/glow-predictor" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gtgold/15 border border-gtgold/40 text-gtgold hover:bg-gtgold/25 transition-all text-xs font-black shadow-sm flex-shrink-0">
                <Sparkles size={12} className="text-gtgold animate-pulse" />
                <span>AI Glow Predictor</span>
              </Link>
              <Link to="/blog" className={`hover:text-gtgold transition-colors ${isActive('/blog') ? 'gt-gold-shiny' : 'text-white/90'}`}>
                Blog
              </Link>
            </div>
          </div>

          {/* Center Group: Top Integrated Gold Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md xl:max-w-xl mx-1 sm:mx-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-gtgold pointer-events-none z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                aria-label="Search top products"
                className="w-full bg-[#12161a] border-2 border-gtgold focus:border-gtgold rounded-full pl-9 pr-16 sm:pr-20 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder:text-gtgold/90 shadow-xl focus:outline-none focus:ring-2 focus:ring-gtgold/40 transition-all font-medium"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}
                  className="absolute right-14 sm:right-16 text-white/50 hover:text-white">
                  <X size={14} />
                </button>
              )}
              <div className="absolute right-1 flex items-center gap-1 z-10">
                {/* Voice Mic Button */}
                <button type="button" onClick={startVoiceSearch} title="ভয়েস সার্চ করুন"
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#161d22] border border-gtgold text-gtgold flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-gtgold/20 ${listening ? 'animate-pulse bg-gtgold/30' : ''}`}>
                  <Mic size={13} />
                </button>
                {/* Camera AI Scan Button */}
                <button type="button" onClick={() => setScanOpen(true)} title="AI Skin Scan — মুখ স্ক্যান করুন"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#161d22] border border-gtgold text-gtgold flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-gtgold/20">
                  <Camera size={13} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Group: Language EN/বা Switcher + Login/Profile Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* EN/বা Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Change Language / ভাষা পরিবর্তন করুন"
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#161d22] border border-gtgold/60 text-gtgold text-xs font-bold hover:bg-gtgold/20 transition-all cursor-pointer shadow-sm"
            >
              <Globe size={13} className="text-gtgold" />
              <span>{i18n.language === 'en' ? 'EN' : 'বা'}</span>
            </button>

            {/* Login / Profile Button */}
            {!user ? (
              <button
                onClick={openLogin}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#161d22] border border-gtgold text-gtgold hover:bg-gtgold hover:text-charcoal text-xs font-black tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5"
              >
                <User size={14} />
                <span>LOGIN</span>
              </button>
            ) : (
              <Link
                to="/profile"
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#161d22] border border-gtgold text-gtgold hover:bg-gtgold hover:text-charcoal text-xs font-black tracking-wider flex items-center gap-1.5 transition-all shadow-md"
              >
                <User size={14} />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.email?.split('@')[0] || 'Profile'}</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ── 3-Line Menu (Hamburger Dropdown Drawer) ── */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0d1216]/98 backdrop-blur-2xl border-b border-gtgold/20 overflow-hidden text-white shadow-2xl"
          >
            <div className="max-w-3xl mx-auto px-5 py-5 space-y-5">
              
              {/* Profile Card inside 3-Line Menu */}
              <div className="bg-[#141a20] border border-gtgold/30 rounded-2xl p-4 shadow-xl">
                {!user ? (
                  <button
                    onClick={() => { openLogin(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-[#1e2630] to-[#141a20] border border-gtgold/40 hover:border-gtgold text-white px-4 py-3.5 rounded-xl font-bold transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gtgold/20 border border-gtgold/60 text-gtgold flex items-center justify-center group-hover:scale-105 transition-transform">
                        <User size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-white">আমার প্রোফাইল (Sign In)</p>
                        <p className="text-[11px] text-gtgold/80">অর্ডার ট্র্যাকিং ও প্রোফাইল দেখতে লগইন করুন</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gtgold bg-gtgold/10 px-3 py-1.5 rounded-full border border-gtgold/30">
                      লগইন
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between bg-gradient-to-r from-[#1e2630] to-[#141a20] border border-gtgold/40 hover:border-gtgold text-white px-4 py-3.5 rounded-xl font-bold transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gtgold/20 border border-gtgold/60 text-gtgold flex items-center justify-center group-hover:scale-105 transition-transform">
                          <User size={22} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-extrabold text-white">{user.email || 'আমার প্রোফাইল'}</p>
                          <p className="text-[11px] text-gtgold">প্রোফাইল বিবরণ ও অর্ডার হিস্ট্রি</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gtgold bg-gtgold/10 px-3 py-1.5 rounded-full border border-gtgold/30">
                        View Profile
                      </span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 w-full bg-gtgold/15 border border-gtgold/40 text-gtgold px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-gtgold/25 transition-all"
                      >
                        <ShieldCheck size={18} /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-red-500/20 transition-all"
                    >
                      <LogOut size={16} /> {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>

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
                        ${active ? `bg-gtgold/20 text-gtgold border-gtgold/50 font-bold` : 'bg-[#12161a] text-gray-200 border-white/10 hover:border-gtgold/40'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${col.bg} flex-shrink-0`} />
                      <span className="text-sm font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Language Switcher */}
              <div className="pt-3 border-t border-gtgold/20">
                <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full text-white font-bold text-xs tracking-widest py-3 bg-[#12161a] border border-gtgold/30 rounded-xl hover:bg-gtgold/10 transition-colors">
                  <Globe size={18} className="text-gtgold" />
                  {i18n.language === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
                </button>
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
