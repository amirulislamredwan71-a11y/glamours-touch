import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LogOut, Globe, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { openLogin } = useUI();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categories, setCategories] = React.useState<string[]>([]);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('name');
        if (data) {
          setCategories(data.map(c => c.name));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gold/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-charcoal hover:text-gold transition-all duration-300 transform hover:scale-110"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mx-1 sm:mx-2">
            <Link to="/" className="group flex items-center gap-4">
              <Logo className="w-12 h-12 sm:w-16 sm:h-16 shadow-xl" />
              <div className="flex flex-col">
                <span className="hidden xs:block text-sm sm:text-xl md:text-2xl font-serif font-bold tracking-[0.1em] text-charcoal group-hover:text-gold transition-colors duration-500 whitespace-nowrap">
                  GLAMOUR'S <span className="text-gold group-hover:text-charcoal transition-colors duration-500">TOUCH</span>
                </span>
                <span className="hidden sm:block text-[8px] font-bold text-gray-400 tracking-[0.3em] uppercase -mt-1 group-hover:text-gold/50 transition-colors">Best Cosmetics</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-12 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path} 
                className="relative text-[11px] font-bold tracking-[0.3em] text-charcoal hover:text-gold transition-colors duration-300 group py-2 uppercase"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 sm:space-x-6">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex lg:flex items-center gap-2 text-gold hover:text-charcoal transition-all duration-300 group"
                    title="Admin Dashboard"
                  >
                    <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-widest">ADMIN</span>
                  </Link>
                )}
                <Link to="/profile" className="hidden xs:flex items-center space-x-3 text-charcoal hover:text-gold transition-all duration-300 group">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gold/20 group-hover:border-gold transition-all duration-300" />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
                      <User size={18} />
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="text-charcoal hover:text-red-500 transition-all duration-300 transform hover:scale-110 hidden lg:block">
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <button 
                onClick={openLogin}
                className="hidden lg:block text-[11px] font-bold tracking-[0.3em] bg-charcoal text-white hover:bg-gold transition-all duration-300 px-8 py-3 rounded-full shadow-lg shadow-charcoal/10 hover:shadow-gold/20 uppercase whitespace-nowrap"
              >
                {t('nav.signIn')}
              </button>
            )}

            {/* Prominent Search on Mobile */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-charcoal hover:text-gold transition-all duration-300 transform hover:scale-110 p-2"
            >
              <Search size={22} />
            </button>

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-charcoal hover:text-gold transition-all duration-300 group px-1 sm:px-2 py-2"
              title={i18n.language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
            >
              <Globe size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold tracking-widest">{i18n.language === 'en' ? 'bn' : 'en'}</span>
            </button>

            <Link to="/cart" className="relative text-charcoal hover:text-gold transition-all duration-300 transform hover:scale-110 group p-2">
              <ShoppingBag size={22} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-gold text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-gold/30"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-gold/10 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6 text-center">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className="block text-2xl font-serif font-bold text-charcoal hover:text-gold transition-all duration-300 uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Categories Section in Mobile Menu */}
              {categories.length > 0 && (
                <div className="pt-8 border-t border-gold/10 text-left">
                  <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-6 px-4">Browse Categories</p>
                  <div className="grid grid-cols-2 gap-3 px-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/shop?category=${encodeURIComponent(cat)}`}
                        className="bg-cream/50 py-4 px-4 rounded-xl text-sm font-bold text-charcoal hover:bg-gold/10 hover:text-gold transition-all text-center border border-gold/5"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gold/10 space-y-6">
                <button 
                  onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full text-charcoal font-bold tracking-widest"
                >
                  <Globe size={20} />
                  {i18n.language === 'en' ? 'বাংলা' : 'ENGLISH'}
                </button>

                {!user ? (
                  <button 
                    onClick={() => { openLogin(); setIsMenuOpen(false); }}
                    className="w-full bg-charcoal text-white py-5 rounded-2xl font-bold tracking-widest uppercase shadow-xl shadow-charcoal/20 flex items-center justify-center gap-3"
                  >
                    <User size={20} />
                    {t('nav.signIn')}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <Link 
                      to="/profile"
                      className="flex items-center justify-center gap-3 w-full bg-charcoal text-white py-4 rounded-full font-bold tracking-widest uppercase"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={20} />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        className="flex items-center justify-center gap-3 w-full bg-gold/10 text-gold py-4 rounded-full font-bold tracking-widest uppercase"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShieldCheck size={20} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full bg-red-50 text-red-500 py-4 rounded-full font-bold tracking-widest uppercase"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 text-white/50 hover:text-gold transition-colors"
            >
              <X size={40} />
            </button>
            <div className="max-w-4xl w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder={t('nav.shop') === 'শপ' ? 'অনুসন্ধান করুন...' : 'Search for products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/10 py-8 text-4xl md:text-6xl font-serif font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-0 bottom-8 text-gold hover:scale-110 transition-transform"
                >
                  <Search size={48} />
                </button>
              </form>
              <div className="mt-12 flex flex-wrap gap-4">
                <span className="text-white/30 text-xs font-bold tracking-widest uppercase">Popular:</span>
                {['Skincare', 'Makeup', 'Fragrance', 'New Arrivals'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => { setSearchQuery(tag); }}
                    className="text-white/60 hover:text-gold text-sm font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
