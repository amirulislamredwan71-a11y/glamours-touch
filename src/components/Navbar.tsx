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

          {/* Logo (Transparent GT Gold emblem & text, NO black square background) */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group flex items-center gap-1.5">
              <Logo className="w-10 h-10 sm:w-16 sm:h-16 drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-lg md:text-xl font-display font-bold tracking-[0.06em] text-white whitespace-nowrap">
                  GLAMOUR'S <span className="gt-gold-shiny">TOUCH</span>
                </span>
                <span className="text-[5px] sm:text-[7px] font-bold text-gray-400 tracking-[0.2em] uppercase -mt-0.5 whitespace-nowrap hidden xs:inline">BEAUTY • SKINCARE</span>
              </div>
            </Link>
          </div>

          {/* Top Integrated Gold Search Bar (Screenshot Spec) */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-gtgold pointer-events-none z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                aria-label="Search top products"
                className="w-full bg-[#12161a] border border-gtgold/60 focus:border-gtgold rounded-full pl-10 pr-20 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-gtgold/60 shadow-lg focus:outline-none focus:ring-1 focus:ring-gtgold transition-all"
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

          {/* ── Icons ── */}
          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-gold hover:text-white transition-all group" title="Admin">
                    <ShieldCheck size={20} />
                  </Link>
                )}
                <Link to="/profile" className="hidden xs:flex items-center text-white/80 hover:text-gtgold transition-all">
                  <User size={20} />
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-all hidden lg:block">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={openLogin}
                className="hidden lg:block text-[10px] font-bold tracking-[0.2em] bg-charcoal text-white hover:bg-gold transition-all px-4 py-2 rounded-full shadow-lg uppercase whitespace-nowrap">
                {t('nav.signIn')}
              </button>
            )}

            {/* Language */}
            <button onClick={toggleLanguage}
              className="flex items-center gap-1 text-white/80 hover:text-gtgold transition-all group px-1 py-1">
              <Globe size={16} />
              <span className="text-[10px] font-bold tracking-widest">{i18n.language === 'en' ? 'বা' : 'EN'}</span>
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-white/80 hover:text-gtgold transition-all group p-1.5">
              <ShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gtgold text-charcoal text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
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

              {/* Categories — compact colourful chips */}
              {categories.length > 0 && (
                <div className="pt-5 border-t border-gold/10">
                  <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase mb-3">Browse Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, i) => (
                      <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${CAT_COLORS[i % CAT_COLORS.length]}`}
                        onClick={() => setIsMenuOpen(false)}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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

      {/* ── Search Modal with Autocomplete ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-charcoal/96 backdrop-blur-2xl flex items-start justify-center pt-28 px-4">
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSuggestions([]); }}
              className="absolute top-8 right-8 text-white/50 hover:text-gold transition-colors">
              <X size={36} />
            </button>

            <div className="max-w-3xl w-full">
              <form onSubmit={handleSearch} className="relative">
                <input autoFocus type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-6 text-3xl md:text-5xl font-serif font-bold text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-all"
                />
                <button type="submit" className="absolute right-0 bottom-6 text-gold hover:scale-110 transition-transform">
                  <Search size={40} />
                </button>
              </form>

              {/* Autocomplete suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => pickSuggestion(s)}
                        className="w-full text-left px-6 py-4 text-white hover:bg-gold/20 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                        <Search size={14} className="text-gold flex-shrink-0" />
                        <span className="font-medium">{s}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular tags */}
              {suggestions.length === 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  <span className="text-white/30 text-xs font-bold tracking-widest uppercase self-center">Popular:</span>
                  {['Skincare', 'Makeup', 'Fragrance', 'Serum', 'Lipstick'].map(tag => (
                    <button key={tag} onClick={() => pickSuggestion(tag)}
                      className="px-4 py-2 bg-white/10 hover:bg-gold/30 text-white/70 hover:text-white text-sm font-medium rounded-full transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              )}
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
