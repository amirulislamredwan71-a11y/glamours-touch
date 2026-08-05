import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Truck, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../hooks/useCart';

/** Official Messenger logo with brand gradient (lucide has no Messenger glyph). */
const MessengerIcon = ({ size = 18 }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="gt-messenger-grad" cx="0.5" cy="0.99" r="1.1">
        <stop offset="0" stopColor="#0099FF" />
        <stop offset="0.6" stopColor="#A033FF" />
        <stop offset="0.9" stopColor="#FF5280" />
        <stop offset="1" stopColor="#FF7061" />
      </radialGradient>
    </defs>
    <path d="M18 0C7.9 0 0 7.4 0 17.4c0 5.24 2.15 9.77 5.65 12.9.29.26.47.63.48 1.02l.1 3.2c.03 1.02 1.08 1.68 2.01 1.27l3.57-1.57c.3-.13.63-.16.95-.08 1.64.45 3.39.69 5.24.69 10.1 0 18-7.4 18-17.4S28.1 0 18 0z" fill="url(#gt-messenger-grad)" />
    <path d="M7.19 22.56l5.29-8.39c.84-1.33 2.64-1.66 3.9-.71l4.2 3.15c.39.29.91.29 1.3 0l5.68-4.31c.76-.58 1.75.33 1.24 1.14l-5.29 8.39c-.84 1.33-2.64 1.66-3.9.71l-4.2-3.15a1.09 1.09 0 00-1.3 0l-5.68 4.31c-.76.58-1.75-.33-1.24-1.14z" fill="#fff" />
  </svg>
);

const BottomNav = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const tabs: {
    to?: string;
    href?: string;
    external?: boolean;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    badge?: number;
  }[] = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: 'https://m.me/1002146686323797', icon: MessengerIcon, label: 'Messenger', external: true },
    { to: '/track-order', icon: Truck, label: 'Track' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const { icon: Icon, label } = tab;
          if (tab.external) {
            return (
              <a
                key={label}
                href={tab.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-500 active:text-gold transition-colors"
              >
                <Icon size={18} className="text-gray-400" />
                <span className="text-[9px] font-bold tracking-wide uppercase text-gray-500">{label}</span>
              </a>
            );
          }
          return (
            <NavLink
              key={label}
              to={tab.to!}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative ${
                  isActive ? 'text-gold' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-gold' : 'text-gray-400'} />
                  <span className={`text-[9px] font-bold tracking-wide uppercase ${isActive ? 'text-gold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
