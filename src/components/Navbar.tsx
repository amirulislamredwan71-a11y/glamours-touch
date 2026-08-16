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

  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  /* Rotate top product placeholders every 3.5 seconds */
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  /* Instant Live Search Query against Supabase */
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, brand, image, price')
          .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
          .limit(6);

        if (!error && data) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* Close dropdown when clicking outside */
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Listen for BottomNav 3-Line Menu trigger */
  React.useEffect(() => {
    const handleToggle = () => setIsMenuOpen((prev) => !prev);
    window.addEventListener('gt-toggle-menu', handleToggle);
    return () => window.removeEventListener('gt-toggle-menu', handleToggle);
  }, []);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
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
    <nav className="fixed top-0 left-0 right-0 z-[999] bg-[#080c16]/98 backdrop-blur-xl border-b border-gtgold/30 transition-all duration-300 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px] md:h-24 gap-2 lg:gap-4">

          {/* Left Group: Logo on Mobile / Hamburger+Logo+Desktop Links on Desktop */}
          <div className="flex items-center gap-1.5 lg:gap-5 flex-shrink-0">
            {/* Hamburger Menu Button (Visible on Desktop/Tablet header, hidden on mobile in favor of Bottom Nav Menu button) */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
              className="hidden md:flex p-1.5 text-white/80 hover:text-gtgold transition-all duration-300">
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Top Left Logo (Prominent on Mobile & Desktop) */}
            <Link to="/" className="group flex items-center shrink-0 pr-1">
              <Logo className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_10px_rgba(229,184,58,0.7)] group-hover:scale-105 transition-transform duration-300" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-3 lg:gap-5 text-xs lg:text-sm font-extrabold tracking-wide">
              <Link to="/" className="gt-gold-shiny font-black hover:opacity-90 transition-opacity">
                {t('nav.home')}
              </Link>
              <Link to="/shop" className="text-white font-black hover:text-gtgold transition-colors">
                {t('nav.shop')}
              </Link>
              <Link to="/glow-predictor" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gtgold/15 border border-gtgold text-gtgold hover:bg-gtgold/25 transition-all text-xs font-black shadow-sm flex-shrink-0">
                <Sparkles size={12} className="text-gtgold animate-pulse" />
                <span>AI Glow Predictor</span>
              </Link>
              <Link to="/blog" className="text-white font-black hover:text-gtgold transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Center Group: World-Class Expanded Top Search Bar (Fills 100% of Mobile Header Space) */}
          <div className="flex-1 max-w-full md:max-w-md xl:max-w-xl mx-1 sm:mx-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search size={16} className="absolute left-3 text-gtgold pointer-events-none z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                aria-label="Search top products"
                className="w-full bg-[#12161a] border-2 border-gtgold/90 focus:border-gtgold rounded-full pl-9 pr-16 sm:pr-20 py-2 sm:py-2 text-xs sm:text-sm text-white placeholder:text-white/80 shadow-[0_0_15px_rgba(229,184,58,0.25)] focus:outline-none focus:ring-2 focus:ring-gtgold/50 transition-all font-semibold"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                  className="absolute right-14 sm:right-16 text-white/50 hover:text-white z-10">
                  <X size={14} />
                </button>
              )}
              <div className="absolute right-1 flex items-center gap-1 z-10">
                {/* Voice Mic Button */}
                <button type="button" onClick={startVoiceSearch} title="ভয়েস সার্চ করুন"
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#161d22] border border-gtgold text-white flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-gtgold/20 ${listening ? 'animate-pulse bg-gtgold/30' : ''}`}>
                  <Mic size={13} className="text-white" />
                </button>
                {/* Camera AI Scan Button */}
                <button type="button" onClick={() => setScanOpen(true)} title="AI Skin Scan — মুখ স্ক্যান করুন"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#161d22] border border-gtgold text-white flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-gtgold/20">
                  <Camera size={13} className="text-white" />
                </button>
              </div>
            </form>

            {/* Instant Live Dynamic Search Suggestions Dropdown */}
            <AnimatePresence>
              {showDropdown && searchQuery.trim().length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#12161a]/98 backdrop-blur-2xl border-2 border-gtgold/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1"
                >
                  {isSearching ? (
                    <div className="py-4 text-center text-xs text-gtgold font-bold animate-pulse">
                      অরিজিনাল কোরিয়ান প্রোডাক্ট খোঁজা হচ্ছে...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider gt-gold-shiny border-b border-gtgold/20 flex justify-between items-center">
                        <span>ক্যাটালগ প্রোডাক্ট রেজাল্ট ({searchResults.length})</span>
                        <span className="text-white/40">সরাসরি ক্লিক করুন</span>
                      </div>
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`/product/${p.id}`);
                            setShowDropdown(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gtgold/15 transition-all text-left group border border-transparent hover:border-gtgold/30"
                        >
                          <img
                            src={p.image || '/categories/skincare.webp'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gtgold/30 flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-white truncate group-hover:text-gtgold transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-gtgold/80 font-bold">
                              {p.brand || 'K-Beauty'}
                            </p>
                          </div>
                          <div className="text-xs font-black gt-gold-shiny flex-shrink-0">
                            ৳{p.price?.toLocaleString()}
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                          setShowDropdown(false);
                        }}
                        className="w-full text-center py-2 text-xs font-black text-gtgold bg-gtgold/10 hover:bg-gtgold/20 rounded-xl transition-all border border-gtgold/30 mt-1"
                      >
                        সবগুলো প্রোডাক্ট দেখুন ({searchQuery.trim()}) ➔
                      </button>
                    </>
                  ) : (
                    <div className="py-4 text-center text-xs text-white/70">
                      "{searchQuery}" দিয়ে কোনো প্রোডাক্ট পাওয়া যায়নি। <br />
                      <button
                        onClick={() => {
                          navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                          setShowDropdown(false);
                        }}
                        className="mt-2 text-xs font-bold text-gtgold underline"
                      >
                        শপ পেজে ক্যাটাগরি ব্রাউজ করুন ➔
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Group: Language EN/বা Switcher + Login/Profile Button (Hidden on Mobile Header, Inside 3-line menu) */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* EN/বা Language Switcher (Gold) */}
            <button
              onClick={toggleLanguage}
              title="Change Language / ভাষা পরিবর্তন করুন"
              className="hidden md:flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#161d22] border border-gtgold text-gtgold text-xs font-bold hover:bg-gtgold/20 transition-all cursor-pointer shadow-sm"
            >
              <Globe size={13} className="text-gtgold" />
              <span>{i18n.language === 'en' ? 'EN' : 'বা'}</span>
            </button>

            {/* Login / Profile Button (Pure White - 1-by-1 alternating sequence) */}
            {!user ? (
              <button
                onClick={openLogin}
                className="hidden md:flex px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#161d22] border border-white/60 text-white hover:border-gtgold hover:text-gtgold text-xs font-black tracking-wider uppercase transition-all shadow-md items-center gap-1.5"
              >
                <User size={14} className="text-white" />
                <span>LOGIN</span>
              </button>
            ) : (
              <Link
                to="/profile"
                className="hidden md:flex px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#161d22] border border-gtgold text-gtgold hover:bg-gtgold hover:text-charcoal text-xs font-black tracking-wider items-center gap-1.5 transition-all shadow-md"
              >
                <User size={14} />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.email?.split('@')[0] || 'Profile'}</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ── 3-Line Menu (World-Class Mega Mobile Drawer) ── */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0b0e12]/98 backdrop-blur-2xl border-b border-gtgold/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-h-[78vh] overflow-y-auto overscroll-contain touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="max-w-3xl mx-auto px-4 pt-4 pb-32 space-y-6">

              {/* Header Close Bar with Language Switcher */}
              <div className="flex items-center justify-between border-b border-gtgold/20 pb-3">
                <div className="flex items-center gap-2">
                  <Logo className="w-7 h-7" />
                  <span className="text-xs font-black tracking-wider text-gtgold uppercase">Glamour's Touch Menu</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Top Quick Language Switcher */}
                  <button
                    onClick={() => { toggleLanguage(); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gtgold/15 border border-gtgold/40 text-gtgold text-[11px] font-black hover:bg-gtgold/25 transition-all"
                  >
                    <Globe size={13} className="text-gtgold" />
                    <span>{i18n.language === 'en' ? 'বাংলা' : 'EN'}</span>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-gtgold hover:bg-gtgold/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* 1. Profile & Track Order Hero Card */}
              <div className="bg-gradient-to-r from-[#141a20] via-[#101418] to-[#161d24] border border-gtgold/40 rounded-2xl p-4 shadow-xl">
                {!user ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => { openLogin(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between bg-gradient-to-r from-[#1e2630] to-[#141a20] border border-gtgold/50 hover:border-gtgold text-white px-4 py-3 rounded-xl font-bold transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gtgold/20 border border-gtgold/60 text-gtgold flex items-center justify-center group-hover:scale-105 transition-transform">
                          <User size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold text-white">আমার প্রোফাইল (Sign In)</p>
                          <p className="text-[10px] text-gtgold/80">অর্ডার ট্র্যাকিং ও প্রোফাইল দেখতে লগইন করুন</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-gtgold bg-gtgold/15 px-3 py-1.5 rounded-full border border-gtgold/40">
                        লগইন ➔
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between bg-gradient-to-r from-[#1e2630] to-[#141a20] border border-gtgold/50 hover:border-gtgold text-white px-4 py-3 rounded-xl font-bold transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gtgold/20 border border-gtgold/60 text-gtgold flex items-center justify-center group-hover:scale-105 transition-transform">
                          <User size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold text-white truncate max-w-[170px]">{user.email || 'আমার প্রোফাইল'}</p>
                          <p className="text-[10px] text-gtgold">প্রোফাইল বিবরণ ও অর্ডার হিস্ট্রি</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-gtgold bg-gtgold/15 px-3 py-1.5 rounded-full border border-gtgold/40">
                        Profile
                      </span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full bg-gtgold/15 border border-gtgold/40 text-gtgold px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-gtgold/25 transition-all"
                      >
                        <ShieldCheck size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-red-500/20 transition-all"
                    >
                      <LogOut size={15} /> {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Primary Navigation Quick Grid */}
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gtgold mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-gtgold animate-pulse" />
                  <span>মূল পেজসমূহ (Main Pages)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gtgold/40 bg-[#141a20] text-gtgold hover:bg-gtgold/15 font-black text-xs transition-all shadow-md"
                  >
                    <span>🏠</span> <span>হোম (Home)</span>
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gtgold/40 bg-[#141a20] text-gtgold hover:bg-gtgold/15 font-black text-xs transition-all shadow-md"
                  >
                    <span>🛍️</span> <span>সব শপ (Shop)</span>
                  </Link>
                  <Link
                    to="/glow-predictor"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 font-black text-xs transition-all shadow-md col-span-2"
                  >
                    <span>✨</span> <span>AI Glow Predictor Studio</span>
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-black text-xs transition-all shadow-md"
                  >
                    <span>📦</span> <span>অর্ডার ট্র্যাক (Track)</span>
                  </Link>
                  <Link
                    to="/blog"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gtgold/30 bg-[#141a20] text-white hover:bg-gtgold/15 font-bold text-xs transition-all shadow-md"
                  >
                    <span>📰</span> <span>ব্লগ ও টিপস (Blog)</span>
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gtgold/30 bg-[#141a20] text-white hover:bg-gtgold/15 font-bold text-xs transition-all shadow-md"
                  >
                    <span>ℹ️</span> <span>আমাদের সম্পর্কে</span>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gtgold/30 bg-[#141a20] text-white hover:bg-gtgold/15 font-bold text-xs transition-all shadow-md"
                  >
                    <span>📞</span> <span>যোগাযোগ (Contact)</span>
                  </Link>
                </div>
              </div>

              {/* 3. Shop by Category Section */}
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gtgold mb-2.5 flex items-center justify-between">
                  <span>ক্যাটাগরি সিলেক্ট করুন (Shop by Category)</span>
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-[9.5px] font-bold text-white/60 hover:text-gtgold underline">সবগুলো ➔</Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Serum & Essence', icon: '🧪', cat: 'Serum & Essence' },
                    { name: 'Moisturizer & Cream', icon: '🧴', cat: 'Moisturizer & Cream' },
                    { name: 'Cleanser & Oil', icon: '🧼', cat: 'Cleanser' },
                    { name: 'Sunscreen & Toneup', icon: '☀️', cat: 'Sunscreen' },
                    { name: 'Eye & Lip Care', icon: '👁️', cat: 'Eye Care' },
                    { name: 'Hair & Body Care', icon: '💆', cat: 'Hair Care' },
                  ].map((c) => (
                    <Link
                      key={c.name}
                      to={`/shop?category=${encodeURIComponent(c.cat)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 bg-[#141a20] border border-gtgold/20 hover:border-gtgold/50 rounded-xl text-xs font-extrabold text-gray-200 hover:text-gtgold transition-all"
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 4. Top K-Beauty Brands Section */}
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gtgold mb-2.5">
                  অফিশিয়াল কোরিয়ান ব্র্যান্ডস (Popular Brands)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['COSRX', 'Anua', 'Beauty of Joseon', 'Medicube', 'SKIN1004', 'K-Secret', 'DABO', 'Christian Dean'].map((b) => (
                    <Link
                      key={b}
                      to={`/shop?brand=${encodeURIComponent(b)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-1.5 bg-[#141a20] border border-gtgold/30 hover:border-gtgold rounded-lg text-[11px] font-bold text-gray-200 hover:text-gtgold transition-all"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 5. Customer Care & Policies */}
              <div className="pt-2 border-t border-gtgold/20 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  কাস্টমার কেয়ার ও পলিসি (Policies)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-400">
                  <Link to="/shipping-policy" onClick={() => setIsMenuOpen(false)} className="hover:text-gtgold transition-colors">
                    🚚 শিপিং পলিসি
                  </Link>
                  <Link to="/returns-exchanges" onClick={() => setIsMenuOpen(false)} className="hover:text-gtgold transition-colors">
                    🔄 রিটার্ন ও এক্সচেঞ্জ
                  </Link>
                  <Link to="/privacy-policy" onClick={() => setIsMenuOpen(false)} className="hover:text-gtgold transition-colors">
                    🛡️ প্রাইভেসি পলিসি
                  </Link>
                  <Link to="/terms-of-service" onClick={() => setIsMenuOpen(false)} className="hover:text-gtgold transition-colors">
                    📜 টার্মস অফ সার্ভিস
                  </Link>
                  <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="hover:text-gtgold transition-colors col-span-2">
                    ❓ সাধারণ প্রশ্নাবলী (FAQ)
                  </Link>
                </div>
              </div>

              {/* 6. Language Switcher Button */}
              <div className="pt-3 border-t border-gtgold/20">
                <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full text-white font-black text-xs tracking-widest py-3 bg-[#141a20] border border-gtgold/40 rounded-xl hover:bg-gtgold/20 transition-all shadow-md">
                  <Globe size={18} className="text-gtgold" />
                  {i18n.language === 'en' ? 'বাংলায় দেখুন (Switch to Bangla)' : 'View in English'}
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
