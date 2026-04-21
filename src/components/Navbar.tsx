import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LogOut, Globe, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

/* Each nav item gets its own accent colour */
const NAV_COLORS = [
  { bg: 'bg-pink-500',   ring: 'ring-pink-400',   text: 'text-pink-500',   light: 'bg-pink-50'   },
  { bg: 'bg-violet-500', ring: 'ring-violet-400',  text: 'text-violet-500', light: 'bg-violet-50' },
  { bg: 'bg-emerald-500',ring: 'ring-emerald-400', text: 'text-emerald-500',light: 'bg-emerald-50'},
];

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { openLogin } = useUI();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [isMenuOpen,   setIsMenuOpen]   = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery,  setSearchQuery]  = React.useState('');
  const [suggestions,  setSuggestions]  = React.useState<string[]>([]);
  const [categories,   setCategories]   = React.useState<string[]>([]);
  const [allProducts,  setAllProducts]  = React.useState<{ name: string; brand: string }[]>([]);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('products').select('name, brand'),
      ]);
      if (cats)  setCategories(cats.map(c => c.name));
      if (prods) setAllProducts(prods);
    };
    fetchData();
  }, []);

  /* Live autocomplete */
  React.useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const matches = allProducts
      .filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .slice(0, 6)
      .map(p => p.name);
    setSuggestions([...new Set(matches)]);
  }, [searchQuery, allProducts]);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const pickSuggestion = (s: string) => {
    navigate(`/shop?search=${encodeURIComponent(s)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const navItems = [
    { name: t('nav.home'),    path: '/' },
    { name: t('nav.shop'),    path: '/shop' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gold/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-charcoal hover:text-gold transition-all duration-300">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mx-1 sm:mx-2">
            <Link to="/" className="group flex items-center gap-3">
              <Logo className="w-12 h-12 sm:w-16 sm:h-16 shadow-xl" />
              <div className="flex flex-col">
                <span className="hidden xs:block text-sm sm:text-xl md:text-2xl font-serif font-bold tracking-[0.1em] text-charcoal group-hover:text-gold transition-colors duration-500 whitespace-nowrap">
                  GLAMOUR'S <span className="text-gold group-hover:text-charcoal transition-colors duration-500">TOUCH</span>
                </span>
                <span className="hidden sm:block text-[8px] font-bold text-gray-400 tracking-[0.3em] uppercase -mt-1">Best Cosmetics</span>
              </div>
            </Link>
          </div>

          {/* ── Desktop Nav ── colored circle badges ── */}
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map((item, idx) => {
              const col = NAV_COLORS[idx % NAV_COLORS.length];
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 group`}
                >
                  {/* Coloured circle */}
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center ring-2 transition-all duration-300
                    ${active
                      ? `${col.bg} ring-offset-2 ${col.ring} text-white shadow-lg`
                      : `bg-white ${col.ring} ${col.text} group-hover:${col.bg} group-hover:text-white group-hover:shadow-md`
                    }
                  `}>
                    <span className="text-[9px] font-extrabold tracking-tighter uppercase leading-none">
                      {item.name.slice(0, 1)}
                    </span>
                  </span>
                  <span className={`text-[11px] font-bold tracking-[0.25em] uppercase transition-colors duration-300
                    ${active ? col.text : `text-charcoal group-hover:${col.text}`}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ── Icons ── */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-gold hover:text-charcoal transition-all group" title="Admin">
                    <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-widest hidden lg:inline">ADMIN</span>
                  </Link>
                )}
                <Link to="/profile" className="hidden xs:flex items-center text-charcoal hover:text-gold transition-all group">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gold/20 group-hover:border-gold transition-all" />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                      <User size={18} />
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="text-charcoal hover:text-red-500 transition-all hidden lg:block">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={openLogin}
                className="hidden lg:block text-[11px] font-bold tracking-[0.3em] bg-charcoal text-white hover:bg-gold transition-all px-6 py-3 rounded-full shadow-lg uppercase whitespace-nowrap">
                {t('nav.signIn')}
              </button>
            )}

            {/* Search */}
            <button onClick={() => setIsSearchOpen(true)}
              className="text-charcoal hover:text-gold transition-all p-2">
              <Search size={22} />
            </button>



            {/* Language */}
            <button onClick={toggleLanguage}
              className="flex items-center gap-1 text-charcoal hover:text-gold transition-all group px-1 py-2">
              <Globe size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold tracking-widest">{i18n.language === 'en' ? 'বা' : 'EN'}</span>
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-charcoal hover:text-gold transition-all group p-2">
              <ShoppingBag size={22} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-gold text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
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
            <div className="px-6 py-8 space-y-4">
              {/* Coloured pill nav items */}
              <div className="flex flex-col gap-3">
                {navItems.map((item, idx) => {
                  const col = NAV_COLORS[idx % NAV_COLORS.length];
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                        ${active ? `${col.light} ring-2 ${col.ring}` : 'bg-gray-50 hover:' + col.light}`}
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 ${col.ring}
                        ${active ? col.bg + ' text-white' : 'bg-white ' + col.text}`}>
                        <span className="text-[10px] font-extrabold uppercase">{item.name.slice(0, 1)}</span>
                      </span>
                      <span className={`text-lg font-bold tracking-wide ${active ? col.text : 'text-charcoal'}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="pt-6 border-t border-gold/10">
                  <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">Browse Categories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`}
                        className="bg-gray-50 py-3 px-4 rounded-xl text-sm font-bold text-charcoal hover:bg-pink-50 hover:text-pink-500 transition-all text-center border border-gray-100"
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
  );
};

export default Navbar;
