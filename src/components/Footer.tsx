import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ShieldCheck, Truck, Sparkles, Globe, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../hooks/useUI';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

const Footer = () => {
  const { t } = useTranslation();
  const { openLogin } = useUI();
  const { user } = useAuth();

  return (
    <footer className="bg-charcoal text-cream pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section moved to Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 border-b border-white/10 pb-20">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gold mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-3">{t('footer.authentic')}</h3>
            <p className="text-gray-400 text-sm">{t('footer.authenticDesc')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gold mb-6">
              <Truck size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-3">{t('footer.shipping')}</h3>
            <p className="text-gray-400 text-sm">{t('footer.shippingDesc')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gold mb-6">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-3">{t('footer.quality')}</h3>
            <p className="text-gray-400 text-sm">{t('footer.qualityDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-4 mb-6 group">
              <Logo className="w-14 h-14 brightness-0 invert" />
              <div className="flex flex-col">
                <h3 className="text-2xl font-serif font-bold tracking-tighter">
                  GLAMOUR'S <span className="text-gold">TOUCH</span>
                </h3>
                <span className="text-[8px] font-bold text-gray-500 tracking-[0.3em] uppercase">Best Cosmetics</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Bringing the finest Bangladeshi and Indian beauty traditions to your doorstep. Premium cosmetics for the modern individual.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-gold">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/shop" className="hover:text-gold transition-colors">{t('nav.shop')}</Link></li>
              {!user && (
                <li>
                  <button onClick={openLogin} className="hover:text-gold transition-colors flex items-center gap-2">
                    <User size={14} />
                    {t('nav.signIn')}
                  </button>
                </li>
              )}
              <li><Link to="/shop?category=Skincare" className="hover:text-gold transition-colors">Skincare</Link></li>
              <li><Link to="/shop?category=Makeup" className="hover:text-gold transition-colors">Makeup</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-gold">{t('footer.support')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/contact" className="hover:text-gold transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-gold transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-serif font-semibold mb-6 text-gold">{t('footer.getInTouch')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-gold" />
                <a href="mailto:glamourstouch26@gmail.com" className="hover:text-gold transition-colors">glamourstouch26@gmail.com</a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-gold" />
                <a href="tel:+8801712426871" className="hover:text-gold transition-colors">+880 1712-426871</a>
              </li>
              <li className="flex items-center space-x-3">
                <Globe size={16} className="text-gold" />
                <a href="https://glamourstouch.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">glamourstouch.com</a>
              </li>
              <li className="flex items-center space-x-3">
                <Facebook size={16} className="text-gold" />
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">গ্ল্যামার্স টাচ</a>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={16} className="text-gold" />
                <span>Dhaka, Bangladesh, 1207</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 Glamour's Touch. {t('footer.allRightsReserved')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
